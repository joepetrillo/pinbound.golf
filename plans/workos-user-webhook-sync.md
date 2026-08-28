# Implement resilient WorkOS user webhook synchronization

> **Executor instructions:** Read this plan fully before changing code. Preserve the user-owned database/Fluid baseline already present in `package.json`, `bun.lock`, `src/data/db.ts`, `vercel.json`, and `docs/drizzle-neon-database.md`; extend it instead of replacing it or changing transports. Re-read the installed Next.js 16.3 Route Handler documentation, the installed WorkOS 10.9 SDK declarations, and the project database guide before implementation; those version-matched/local sources override remembered APIs. Use Drizzle ORM and committed, generated SQL migrations. Do not use `drizzle-kit push` against shared or production databases. Do not acknowledge a WorkOS delivery until its verified payload is durably stored.
>
> **Planning baseline:** branch `staging`, commit `0efb1ff`, plus the live dirty worktree on 2026-08-12. A conflicting user edit in an in-scope file is a stop condition.

## Status

- **Priority:** P0 foundation for local product data
- **Effort:** L, split into independently verifiable milestones
- **Risk:** HIGH — authentication identity, eventual consistency, public request verification, and durable data all meet here
- **Primary sources:** supplied WorkOS webhook guide; installed `@workos-inc/node@10.9.0` declarations/runtime; installed Next.js 16.3 docs; `docs/drizzle-neon-database.md`; installed Drizzle `node-postgres` adapter; Vercel Fluid pool-lifecycle guidance

## Outcome

Pinbound keeps a minimal local projection of AuthKit users synchronized from WorkOS without making webhook delivery part of the request path for signed-in pages.

The public endpoint will:

1. read the request body once through a hard byte limit;
2. verify the exact collected bytes from `WorkOS-Signature` with the installed WorkOS SDK;
3. durably and idempotently store the verified raw receipt in Postgres;
4. return `HTTP 200` immediately after that durable write; and
5. let a separate, retryable processor update the local user projection.

Duplicate, stale, and out-of-order deliveries will be successful no-ops. A newer deletion will leave a PII-minimized tombstone so an older create/update cannot resurrect the user. New payload fields that Pinbound does not consume will be retained in the inbox and ignored by the projection mapper. Because signature verification is separated from deserialization, a signed receipt with malformed JSON or missing required fields can be durably quarantined without corrupting `app_users` or forcing three days of futile delivery retries.

## Scope

### Included

- WorkOS User Management/AuthKit events:
  - `user.created`
  - `user.updated`
  - `user.deleted`
- Signature verification with `@workos-inc/node` through AuthKit's existing `getWorkOS()` singleton
- Drizzle schema, migration tooling, and a committed initial migration
- A minimal `app_users` projection and durable WorkOS webhook inbox
- Duplicate protection, ordering protection, tombstones, leases, retry/backoff, dead-lettering, and replay
- A fast post-response processing attempt plus a durable scheduled sweep
- Initial backfill and incident reconciliation from the WorkOS User Management API
- Focused unit, route, and disposable-Neon integration tests
- Deployment configuration, observability, retention, and an operator runbook

### Explicitly excluded

- `dsync.*` Directory Sync events
- WorkOS organizations, organization memberships, invitations, roles, and permissions
- Changing the current AuthKit session to use the local user as its authentication authority
- Hard-deleting product data when WorkOS deletes a user
- A customer-facing webhook administration UI
- Treating IP allowlisting or an obscure URL as a replacement for signature verification

If organization or membership synchronization is needed later, add it as a separate projection and processor over the same inbox pattern. Do not silently expand this endpoint's WorkOS subscriptions during this task.

WorkOS's current data-syncing overview prefers the Events API for many user/directory synchronization workloads. Webhooks remain a deliberate, user-directed choice for this implementation. The durable inbox plus canonical reconciliation closes the finite-delivery-window gap without silently changing the requested transport.

## Current repository state

- `src/data/db.ts` is the shared server-only client. It creates one module-global `pg.Pool` for the validated `DATABASE_URL`, with `idleTimeoutMillis: 5000` and `max: 2`, immediately passes that pool to `attachDatabasePool(pool)`, and exposes `drizzle({ client: pool })` from `drizzle-orm/node-postgres`.
- The runtime URL is a pooled Neon hostname containing `-pooler`: the small application-side `pg.Pool` is reused by concurrent invocations in a warm Fluid instance, while Neon's PgBouncer provides server-side transaction pooling.
- Runtime dependencies already include `drizzle-orm@1.0.0-rc.4`, `pg@8.23.0`, and `@vercel/functions@3.9.3`; `@types/pg` is already a development dependency. `drizzle-kit`, a Drizzle config, schemas, migrations, database scripts, and test tooling do not yet exist.
- This session-capable `node-postgres` adapter supports Drizzle's interactive `db.transaction(async (tx) => ...)` API, rollback, and savepoints. In ORM `1.0.0-rc.4`, the PostgreSQL runtime config omits the familiar `{ schema }` option; direct query-builder code imports table objects, while relational queries require `defineRelations(...)` plus `{ relations }`.
- The staged root `vercel.json` already contains the Vercel schema URL and `"fluid": true`; cron registration is the only planned addition to that file.
- `src/features/user/user-queries.ts` reads the request-scoped AuthKit session and returns only `email` and `firstName`. It is intentionally uncached and does not read a local user.
- There is no callback-time database upsert. Webhook synchronization is therefore eventually consistent by design; current signed-in pages must continue to work before a local row arrives.
- `src/proxy.ts` matches almost every normal path. In production coming-soon mode it rewrites every matched path except `/coming-soon`, which would prevent both a webhook and a cron request from reaching their handlers.
- There is no test runner configuration, project test suite, queue, cron registration, or reconciliation command.

## Architecture decisions

### 1. Postgres is the durable inbox and source of processing truth

Use the WorkOS event ID as the normal inbox idempotency identity and a payload digest fallback only for malformed envelopes without one. The receiver does not mutate `app_users`; it verifies and inserts only. This keeps the public request short and makes receipt independent from downstream processing.

`next/server`'s `after()` is only a low-latency kick. It is not a durable queue and must never be the sole recovery mechanism. A protected scheduled route sweeps pending events and expired leases. If a process dies after returning 200, the committed inbox row remains available to that sweeper. Catch and PII-safely log registration errors and callback rejections that occur while the invocation is alive. A platform termination at `maxDuration` cannot be caught by application code; platform timeout logs plus the expired lease and scheduled sweep provide recovery. None of these failures changes the receipt response once the row is durable.

Do not add Vercel Queues for the first implementation. The Postgres inbox already supplies durable storage, replay, leasing, and application-visible status without making a beta service another correctness dependency. The processor API should remain transport-agnostic so a managed queue can replace the `after()`/cron wake-up mechanism later without changing event semantics.

### 2. WorkOS and Pinbound own different data

- WorkOS remains authoritative for authentication, sessions, and the mirrored identity fields.
- `app_users` is a local projection keyed by immutable `workos_user_id`; email is mutable data, not identity, and must not be the primary or unique linkage.
- Pinbound-owned product/profile fields added later must be separate columns or tables and must never be overwritten by the WorkOS mapper.
- A WorkOS deletion soft-deletes the projection and clears mirrored email/name/profile PII. It retains only the WorkOS ID, local ID, source watermarks, and tombstone metadata needed for integrity. It does not cascade-delete workspaces, audit history, or other Pinbound product data.

### 3. Delivery and processing have separate retry contracts

- Before a durable inbox insert succeeds, a non-2xx response intentionally asks WorkOS to redeliver. WorkOS retries production delivery with exponential backoff for up to three days (up to six retries); staging retries for only several minutes.
- After the receiver returns 200, WorkOS delivery is complete. Pinbound's processor owns all subsequent retries and state.
- A duplicate delivery never resets attempts, status, errors, or processing timestamps. It may trigger another best-effort kick for the existing row.

### 4. Type safety is narrow at the boundary and permissive about additions

Use SDK types for compile-time constraints:

```ts
type WorkOSUserEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;
```

The installed SDK's runtime can deserialize an unknown event through a default branch, while `constructEvent()` is declared as `Promise<Event>` and `UnknownEvent` is not included in that union. Moreover, `UnknownEvent["event"]` is broad `string`, so `Event | UnknownEvent` is not a safely discriminated union for known event literals. Do not cast stored JSON to either SDK type and do not use an `assertNever` that would turn a new signed event into a failure loop.

Verify the raw bytes first with the SDK's public `webhooks.verifyHeader(...)`. Then parse a loose snake_case wire envelope. For the three supported names, use loose event-specific schemas that transform to a stable internal mutation DTO. The successful decoder output—not a cast—is the runtime narrowing boundary. Constrain the mapper and transformed DTO with `UserCreatedEvent`, `UserUpdatedEvent`, `UserDeletedEvent`, and `Pick<User, ...>` from `@workos-inc/node` so package upgrades reveal fields/types Pinbound depends upon. Normalize absent optional profile fields (`name`, `firstName`, `lastName`, `profilePictureUrl`, and `locale`) to `null`. Do not recreate a strict schema for the complete WorkOS payload.

Store the exact verified bytes as `bytea` plus parsed semantic JSON as `unknown` JSONB when parsing succeeds. Do not type the JSONB column as SDK `Event`: raw webhook JSON is snake_case, while `constructEvent()` returns camelCase SDK models and drops user fields unknown to that SDK version. The installed SDK has no public "deserialize an old stored payload without verifying its now-expired signature" method, so replay uses the same local raw decoder as first processing.

### 5. Freshness is enforced atomically at write time

WorkOS does not guarantee event order. Give webhook processing and successful canonical reads the same explicit source tuple for a `workos_user_id`:

1. source object's `updatedAt`;
2. source observation time—webhook envelope `createdAt`, or the timestamp captured **before** the reconciliation page/get request;
3. mutation precedence when both timestamps tie (`deleted` wins over `active`); and
4. source ID only as a deterministic final tie-breaker, never by assuming a WorkOS ID format is time-sortable.

The conditional upsert must place this comparison in SQL/Drizzle conflict conditions. Do not implement it as an unprotected read followed by a write. `user.created` and `user.updated` both upsert the complete selected projection, so update-before-create works. `user.deleted` upserts a tombstone even if no row exists, so delete-before-create is safe. Its `deletedAt` is the webhook envelope time, not the user object's older `updatedAt`. Stale events are marked successfully processed and do not retry.

Confirmed absence needs one additional cross-source rule because a 404 has no remote object timestamp. Store a nullable `notFoundObservedAt` barrier on the tombstone. A confirmed `getUser()` 404 may update the row only if no already-applied source was observed after that request began; it preserves the existing object watermark and advances the absence barrier to the request-start time. While that barrier exists, an active webhook may restore the user only when its envelope `createdAt` is strictly later than the barrier; a successful canonical list/get result may restore it only when that request's observation time is strictly later. A delayed pre-barrier update cannot resurrect the user merely because its object `updatedAt` is higher. An accepted active source clears the barrier, after which the normal tuple applies. Implement these conditions atomically alongside the normal tuple.

For reconciliation, create a synthetic source ID such as `reconciliation:<run-id>:<page-or-user-id>`. Never use one end-of-run timestamp for every page. Race tests are required before the reconciliation algorithm is accepted.

### 6. Preserve the Fluid Compute pool lifecycle

Keep one `pg.Pool` at module scope, attach it exactly once immediately after construction with `attachDatabasePool(pool)`, and pass it to Drizzle's `node-postgres` adapter. Never create or close a pool inside a Route Handler, Server Action, query, processor callback, or reconciliation loop, and never call `pool.end()` from application runtime code. Keep the Node.js runtime, the pooled Neon `DATABASE_URL`, `idleTimeoutMillis: 5000`, `max: 2`, and `vercel.json`'s `fluid: true` setting. Do not raise the pool limit without observed Fluid concurrency, query latency, pool-wait, and Neon connection metrics; `max: 1` is not an acceptable attempt to reduce total connections because it harms in-instance concurrency.

Add exactly one module-scope `pool.on("error", ...)` listener immediately after construction so an idle-client error from a transient Neon disconnect is handled instead of becoming an unhandled EventEmitter error that can terminate the Fluid instance. Emit only a sanitized error class/code through the project's PII-safe logger; never log the connection URL, query, payload, or user data, and never call `process.exit()` from the listener. This is the only planned behavioral addition to the shared client setup.

Fluid may run multiple webhook, cron, and page invocations concurrently in the same process, and they share those two pool clients. Decode/validate payloads and perform every non-database operation before opening a transaction. Keep callback transactions short, database-only, and free of WorkOS/network calls. Process claimed events sequentially in each initial drain rather than launching an unbounded `Promise.all`; database leases provide cross-invocation concurrency, while the pool queues brief contention. Any later increase in per-drain concurrency must use a tiny explicit limiter and be justified by production pool metrics.

The pooled Neon URL uses PgBouncer transaction pooling. Ordinary Drizzle callback transactions, row locks, `SKIP LOCKED`, CTEs, and savepoints are supported. Do not introduce persistent `SET`/`RESET`, `LISTEN`/`NOTIFY`, session-level advisory locks, holdable cursors, or other cross-transaction session state. Do not add a PostgreSQL.js `prepare: false` option; this project uses `pg`, not PostgreSQL.js.

## Request and processing flow

```text
WorkOS
  -> POST /api/webhooks/workos
     -> stream and bound raw bytes once
     -> verify exact bytes + SDK age/HMAC with verifyHeader()
     -> parse loose envelope or classify malformed receipt
     -> durable inbox upsert by event ID/digest
     -> register after() kick only after persistence succeeds
     -> 200 for inserted or duplicate event

after() kick ---------------------+
                                    -> atomically claim due inbox rows
scheduled sweep (every minute) ---+   -> narrow + validate selected event
                                        -> freshness-protected user upsert/tombstone
                                        -> mark processed/ignored
                                        -> or schedule retry/dead-letter
```

The scheduled sweep is the recovery guarantee in production and every persistent staging environment; ephemeral previews have manual draining only. The `after()` path may make normal processing nearly immediate, but no acceptance test may depend on it running.

## Data model

Create database schema modules under `src/data/schema/` and export them from `src/data/schema/index.ts`. Keep the existing module-global `pg.Pool`, `attachDatabasePool`, and `drizzle-orm/node-postgres` singleton unchanged; import table objects directly into query-builder code because this installed Drizzle RC does not accept the familiar runtime `{ schema }` configuration.

### `app_users`

| Column | Type / constraint | Purpose |
| --- | --- | --- |
| `id` | UUID primary key, generated locally | Stable Pinbound identifier for future foreign keys |
| `workos_user_id` | text, not null, unique | Immutable source identity and upsert target |
| `email` | text, nullable, indexed but not unique | Mutable WorkOS email; cleared on deletion |
| `email_verified` | boolean, not null | Mirrored WorkOS verification state |
| `first_name` | text, nullable | Mirrored profile field; cleared on deletion |
| `last_name` | text, nullable | Mirrored profile field; cleared on deletion |
| `name` | text, nullable | Mirrored display name; cleared on deletion |
| `profile_picture_url` | text, nullable | Mirrored profile image; cleared on deletion |
| `locale` | text, nullable | Mirrored locale without a database enum; cleared on deletion |
| `workos_created_at` | timestamptz, not null | Source object creation time |
| `source_object_updated_at` | timestamptz, not null | Primary cross-source freshness watermark |
| `last_source_observed_at` | timestamptz, not null | Webhook event time or reconciliation request-start time |
| `last_source_id` | text, not null | WorkOS event ID or documented synthetic reconciliation ID |
| `last_source_kind` | checked text | `webhook` or `reconciliation` |
| `last_source_mutation` | checked text | `active` or `deleted`, for precedence and diagnosis |
| `sync_state` | checked text: `active` or `deleted` | Avoid a hard database enum while retaining validation |
| `deleted_at` | timestamptz, nullable | Webhook event time or confirmed-404 observation time |
| `not_found_observed_at` | timestamptz, nullable | Canonical-absence barrier; only a later-observed active source may clear it |
| `created_at` | timestamptz, default now, not null | Local row creation |
| `updated_at` | timestamptz, default now, not null | Local projection update |

Add checks requiring `email IS NOT NULL`, `deleted_at IS NULL`, and `not_found_observed_at IS NULL` when `sync_state = active`; require mirrored PII fields to be null and `deleted_at IS NOT NULL` when `sync_state = deleted`. A webhook tombstone may have a null absence barrier, while a reconciliation-404 tombstone has one. Do not project `metadata` or `externalId` until a product requirement uses them. They remain available in retained raw receipts for the bounded retention period.

### `workos_webhook_events`

| Column | Type / constraint | Purpose |
| --- | --- | --- |
| `id` | UUID primary key, generated locally | Stable receipt identifier even for a malformed envelope |
| `dedupe_key` | text, not null, unique | `workos:<event-id>` when usable, otherwise `sha256:<payload-digest>` |
| `workos_event_id` | text, nullable, unique | Normal WorkOS idempotency identity; nullable for quarantined malformed envelopes |
| `payload_sha256` | text, not null | Duplicate anomaly detection without logging payload data |
| `raw_payload` | bytea, nullable after retention redaction | Exact verified bytes used by signature verification and replay |
| `payload` | jsonb typed as `unknown`, nullable | Parsed semantic JSON, preserving additive keys but not byte representation |
| `event_type` | text, nullable | Forward-compatible discriminator; do not use a DB enum |
| `object_id` | text, nullable | WorkOS user ID when safely extractable |
| `event_created_at` | timestamptz, nullable | WorkOS envelope time when valid |
| `object_updated_at` | timestamptz, nullable | Source object watermark when available |
| `status` | checked text | `pending`, `processing`, `processed`, `ignored`, or `dead_letter` |
| `disposition` | checked nullable text | `applied`, `stale`, `unsupported`, or `invalid` |
| `cycle_attempt_count` | integer, default 0, non-negative | Attempts in the current retry/replay cycle |
| `total_attempt_count` | integer, default 0, non-negative | Lifetime attempts retained across replay |
| `retry_cycle_started_at` | timestamptz, default now, not null | Age cap for the current cycle |
| `next_attempt_at` | timestamptz, default now, not null | App-owned retry schedule |
| `lease_token` | UUID, nullable | Fences every transition to the current claimant |
| `lease_expires_at` | timestamptz, nullable | Crash recovery and concurrent-worker exclusion |
| `last_attempt_at` | timestamptz, nullable | Operational trace |
| `processed_at` | timestamptz, nullable | Terminal completion time |
| `last_error_code` | text, nullable | Stable, non-sensitive classification |
| `last_error_message` | varchar(500), nullable | Sanitized diagnostic; never raw payload or secrets |
| `processor_version` | integer, default 1, not null | Enables targeted replay after processor changes |
| `replay_count` | integer, default 0, non-negative | Lifetime approved replays |
| `last_replayed_at` | timestamptz, nullable | Replay audit timestamp |
| `delivery_count` | integer, default 1, non-negative | Signed delivery/duplicate count only |
| `last_received_at` | timestamptz, default now, not null | Most recent signed duplicate receipt |
| `payload_mismatch_detected_at` | timestamptz, nullable | Same event ID/dedupe key arrived with a different digest |
| `received_at` | timestamptz, default now, not null | First durable receipt; duplicates do not change it |
| `payload_redacted_at` | timestamptz, nullable | PII-retention audit field |

Add:

- a composite/partial due-work index on `status` and `next_attempt_at`;
- an index for expired `processing` leases;
- an index on `object_id` plus source time for diagnosis; and
- check constraints for status/disposition, retry/lifetime counts, lease state, active versus terminal timestamps, and payload redaction where practical.

For valid events, `dedupe_key` uses the WorkOS event ID and `ON CONFLICT (dedupe_key)` preserves the first payload while incrementing only duplicate-delivery metadata. Compare the incoming digest/type with the stored values; record and alert on anomalous event-ID reuse, but still return 200 for the already-durable identity to avoid a retry storm. For a signed malformed envelope without a usable ID, its content digest provides repeatable quarantine deduplication.

The migration must prove the dedupe/event ID constraints, unique WorkOS user ID, due-work indexes, and active/deleted checks exist. Keep schema types local to the data layer; return stable user DTOs from `src/features/user/user-queries.ts` when product reads are introduced.

## File plan

| File | Planned responsibility |
| --- | --- |
| `drizzle.config.ts` | PostgreSQL dialect, schema path, migration output, and validated direct `DATABASE_URL_UNPOOLED` used only by Drizzle Kit |
| `drizzle/**` | Generated, committed SQL migration and Drizzle metadata |
| `src/data/db.ts` | Preserve the existing server-only, module-global `pg.Pool` + `attachDatabasePool` + `node-postgres` singleton and pool settings; add one sanitized idle-pool error listener, no per-request factory |
| `src/data/schema/app-users.ts` | `app_users` table, constraints, indexes, inferred row types |
| `src/data/schema/workos-webhook-events.ts` | Durable inbox table, checks, and due-work indexes |
| `src/data/schema/index.ts` | Schema exports consumed by Drizzle and Drizzle Kit |
| `src/features/user/user-webhook-schema.ts` | Loose snake_case raw decoders and transforms for only the envelope/projection fields Pinbound requires |
| `src/features/user/user-webhook-sync.ts` | Server-only receipt persistence, package-constrained mapping, fenced claim/processing, retry, and replay logic |
| `src/features/user/user-reconciliation.ts` | Server-only canonical WorkOS list/get reconciliation using the same projection mapper |
| `src/app/api/webhooks/workos/route.ts` | Thin public POST adapter: raw body/header extraction and safe HTTP result mapping |
| `src/app/api/cron/workos-user-sync/route.ts` | Thin `CRON_SECRET`-protected GET adapter that drains bounded due work |
| `scripts/reconcile-workos-users.ts` | Operator-facing initial backfill/repair command with dry-run and summary |
| `scripts/replay-workos-user-event.ts` | Requeue one retained dead-letter event by ID without bypassing validation |
| `tests/support/database.ts` | Disposable-test-only `pg.Pool`/Drizzle harness returning both handles so teardown can call `pool.end()` |
| `vercel.json` | Merge one-minute production sweep registration while retaining the existing schema URL and `"fluid": true` |
| `src/proxy.ts` | Exact webhook and cron exclusions from AuthKit/coming-soon proxying |
| `src/env.config.ts` / `.env.example` | Runtime webhook/cron flags plus CLI-only direct migration and disposable test database documentation; do not make the migration URL a Next runtime requirement |
| `package.json` / `bun.lock` | Retain the existing ORM/`pg`/Vercel runtime stack; add compatible Drizzle Kit, Bun types, and database/test/reconciliation scripts |

Keep all user synchronization code in the existing `user` feature. Do not create a top-level `webhook` feature for a transport concern.

## Milestone 1 — Establish Drizzle schema and migrations

1. Retain the existing `drizzle-orm` dependency declaration and locked `1.0.0-rc.4` runtime. Add `drizzle-kit@rc` and verify the lockfile resolves Kit to the compatible `1.0.0-rc.4` release; if the tag advances, explicitly select the RC compatible with the locked ORM instead of mixing release lines. Add `@types/bun` for `bun:test` and script typing. Do not add another PostgreSQL driver.
2. Add scripts with unambiguous names, at minimum:
   - `db:generate`
   - `db:migrate`
   - `db:check`
   - `test`
   - `test:integration`
3. Add `drizzle.config.ts`, pointing Kit's `schema` path at `src/data/schema/index.ts`. Read a CLI-only `DATABASE_URL_UNPOOLED` directly from the command environment, validate that it is a direct Neon URL rather than a `-pooler` hostname, and use it for schema checks/migrations. Document it in `.env.example`, but do not add it to the Next runtime `envStrict`/server schema: application builds and requests require only the pooled `DATABASE_URL`.
4. Add the two schema tables, checks, and indexes described above.
5. Preserve `src/data/db.ts`'s single module-global pool, immediate `attachDatabasePool(pool)`, `idleTimeoutMillis: 5000`, `max: 2`, and `drizzle({ client: pool })`. Add exactly one sanitized module-scope pool error listener as described above. Do not add a runtime factory, create/close pools per invocation, change transports, or pass `{ schema }`. Keep direct table imports for query-builder operations; if relational queries become necessary, use the installed v1 `defineRelations(schema)` API and pass `{ relations }` only after type-checking it.
6. Generate and inspect the SQL migration. Commit generated SQL and metadata.
7. Define `db:migrate` as `drizzle-kit migrate`; schema generation/checking and migrations use the direct CLI-only URL, while application traffic continues to use the pooled URL.
8. Apply the migration only to the intended development/test database through its direct URL, then inspect the resulting tables and indexes.

### Milestone 1 verification

- Generation is repeatable and produces no unexpected second diff.
- Migration succeeds on an empty database and `db:check` passes.
- A duplicate dedupe key/WorkOS event ID and duplicate WorkOS user ID are handled or rejected at the database level as designed.
- A callback-transaction test proves a later failure rolls back earlier writes, and a subsequent query proves the checked-out client was returned to the pool.
- The installed `node-postgres` adapter type-checks and executes `db.transaction(async (tx) => ...)`; every transactional query uses `tx`, never the outer `db`.
- Runtime Drizzle configuration type-checks on `1.0.0-rc.4` without `{ schema }`.
- Runtime preflight confirms `DATABASE_URL` uses a pooled Neon `-pooler` hostname and migration preflight confirms `DATABASE_URL_UNPOOLED` is direct, without logging either URL.
- Repeated runtime operations reuse the one bounded pool; application code never calls `pool.end()`.
- Exactly one pool error listener is registered; a synthetic idle-client error is handled without leaking connection/query data or exiting the process.

## Milestone 2 — Build the verified, idempotent receiver

1. Add `WORKOS_WEBHOOK_SECRET` to `envStrict`, the server schema, and `.env.example`. Validate it as a non-empty secret without assuming an undocumented prefix. Because this repo imports env validation from `next.config.ts`, missing configuration must fail build/start; it is a deployment gate, not a runtime 503 branch.
2. Use the exact public path `/api/webhooks/workos`; deliberately defer the guide's obscured-path suggestion because signed timestamped HMAC is the authentication boundary and a hidden path leaks into provider/deployment logs anyway. Exclude exactly that path plus an optional trailing slash from `src/proxy.ts`, not descendants or every `/api` route. The combined matcher should follow the shape `api/(?:webhooks/workos|cron/workos-user-sync)/?$` and tests must prove child/lookalike paths still pass through Proxy.
3. Configure defense-in-depth at the platform edge, not from spoofable forwarded-IP headers. Before production, verify WorkOS's **current** official egress list and configure a Vercel Firewall allowlist if the deployed plan supports it; document any explicit exception and a process for updating the list. Signature verification remains mandatory either way. Confirm BotID, Deployment Protection, WAF, and other platform rules allow the WorkOS request.
4. Set a conservative application limit of 256 KiB for this small event family:
   - fast-reject a valid declared `Content-Length` above the limit;
   - consume `request.body` once with a stream reader, count actual bytes, cancel/reject as soon as the hard limit is exceeded, and concatenate only bounded chunks;
   - cover absent and falsely small `Content-Length` in tests; and
   - pass the resulting `Uint8Array` to all later steps without reading the request again.
5. In the thin POST flow:
   - read `request.headers.get("workos-signature")`;
   - call `getWorkOS().webhooks.verifyHeader({ payload: rawBytes, sigHeader, secret })` so signature/SDK age validation happens before parsing or trusting fields;
   - use the installed SDK's default tolerance rather than copying a cross-SDK numeric value;
   - compute a SHA-256 digest of the verified bytes;
   - UTF-8 decode and parse to `unknown` JSON when possible;
   - extract only nullable receipt metadata through a loose envelope parser;
   - derive `dedupe_key` from a usable event ID or the digest fallback;
   - insert a usable envelope as `pending`, but insert signed invalid JSON/envelopes directly as `dead_letter`/`invalid` with terminal time, stable error code, exact bytes, and nullable metadata; and
   - use one atomic `INSERT ... ON CONFLICT (dedupe_key)` statement that preserves the first payload and processing state while updating only delivery/anomaly metadata.
6. Only after the durable upsert succeeds, best-effort register an injected scheduler that the real route implements with `after(...)`. If processing is enabled, give this kick a five-second/one-event drain budget. Wrap both scheduler registration and the callback in PII-safe error handling; their failure cannot change the 200 receipt result.
7. Use the Node runtime default, do not add `dynamic = "force-dynamic"`, and set an explicit webhook `maxDuration` around 15 seconds so the response is fast and the optional kick is bounded. POST is uncached. The handler's critical path remains byte collection, verification, hashing/parsing, and one durable upsert—never user projection processing.
8. Return an empty or minimal explicit `200` for a newly stored receipt, a duplicate, or a durably quarantined signed malformed receipt. Map failures without leaking details:
   - missing/invalid/too-old signature: `400` and no row;
   - over-size body: `413` and no row;
   - failed durable upsert or unexpected receiver failure: `503`/`500`, so WorkOS retries;
   - never return a raw SDK/SQL error body.

### Milestone 2 verification

- A valid signed request creates one inbox row and returns 200.
- Replaying it returns 200, increments only delivery metadata, and leaves the original payload and processing state unchanged.
- Reusing the same signed event ID with a different digest preserves the first payload, records/alerts the anomaly, and causes no second effect.
- Whitespace/body alteration after signing fails verification.
- An otherwise correctly signed receipt older than the SDK default tolerance returns 400 and creates no row.
- Missing/invalid signatures create no row.
- Missing or falsely small `Content-Length` cannot bypass the actual-byte limit.
- A forced database insert failure returns non-2xx.
- A signed payload with additional envelope or user fields is accepted; exact bytes and the extra JSON keys remain stored.
- Signed invalid JSON or a signed envelope missing ID/type/time is durably dead-lettered by digest and returns 200.
- A signed unknown event name is accepted into the inbox rather than crashing the route.
- Failure/timeout of the `after()` kick leaves the committed row due and does not affect the 200.
- The one-event `after()` drain claims at most its targeted row; all other due rows remain `pending` with unchanged attempt counters.
- A running-Next test proves the response does not wait for a deliberately delayed processing callback; unit tests inject/mock the scheduler because real `after()` requires Next request context.
- The endpoint reaches the Route Handler while `COMING_SOON_MODE` is enabled.

## Milestone 3 — Implement safe projection processing

### Claiming work

Use one atomic Postgres statement (CTE plus `UPDATE ... RETURNING`, expressed through Drizzle SQL when the query builder cannot represent it) to claim a bounded batch:

- include due `pending` rows;
- reclaim `processing` rows whose lease expired;
- order by `next_attempt_at`, then `received_at`;
- use row locking/`SKIP LOCKED` or equivalent conditional-update semantics;
- generate a fresh claim UUID, set `status = processing`, increment both cycle and lifetime attempt counts, and set `lease_token` plus a two-minute lease; and
- return only the rows that this worker owns.

Multiple `after()` callbacks, cron invocations, and manual drains must be safe concurrently. Do not depend on an in-memory mutex or a global single worker. Make claim limit a required caller parameter that cannot exceed the number of events the invocation can safely begin within its remaining time budget: the five-second `after()` kick passes `1`; cron passes at most `10` and reduces that number as its deadline approaches. Never claim work merely to hold it. Process claimed rows sequentially so one drain does not occupy both clients in the shared Fluid pool, stop before the route budget or lease safety margin, and let the next sweep continue.

The current projection processor performs no external side effects. If a later processor requires slow/network work, redesign it as an explicitly owned staged/outbox operation with provider idempotency and lease renewal where appropriate, while keeping network I/O outside the database transaction. Do not simply perform an external call before ownership or increase the timeout/lease without a new failure-model review.

### Narrowing and validation

1. Treat the stored payload as `unknown` on every processing attempt.
2. Decode retained bytes/JSON with the loose local snake_case schemas; do **not** run signature verification again because the receipt was verified before insertion and its signature timestamp will eventually be outside tolerance.
3. Inspect the raw string discriminator, then parse a matching schema whose successful result is explicitly the stable internal user mutation DTO. Unknown names remain an unknown envelope; they are never cast to a package event type.
4. Use WorkOS package event/User types to constrain event names, selected keys, and mapper output at compile time. Convert ISO strings to valid `Date` values only after runtime validation, and normalize missing optional profile values to `null`.
5. Mark a verified but unsupported event `ignored` with disposition `unsupported`, emit a PII-safe warning, and acknowledge it internally.
6. Mark a supported event with missing/invalid required projection fields `dead_letter` with disposition `invalid`. Retain its bytes/JSON for diagnosis and replay after a processor fix.

### Applying create/update/delete

- Complete raw decoding, runtime validation, field mapping, and failure classification before opening a transaction.
- `user.created` and `user.updated` call the same complete projection upsert.
- `user.deleted` calls a tombstone upsert that sets `sync_state = deleted` and `deleted_at`, while preserving the row and local ID.
- All three use the freshness tuple in the conflict `WHERE` condition.
- A stale mutation affects no user row but still makes the event terminal with disposition `stale`.
- An accepted mutation records the event watermarks and disposition `applied`.
- Clear mirrored PII, reset `email_verified` to false, and set `deleted_at` from the envelope event time on an accepted deletion.
- For each successfully decoded supported event, run one short `db.transaction(async (tx) => ...)`. Inside it:
  1. reselect and lock the inbox row (`FOR UPDATE` through Drizzle SQL where necessary) only when its ID, `status = processing`, `lease_token`, and `lease_expires_at > clock_timestamp()` match the claim;
  2. return a lost-ownership no-op without touching `app_users` when that row is absent;
  3. execute the freshness-conditioned user upsert/tombstone through `tx` and inspect `RETURNING` to derive `applied` versus `stale`; and
  4. terminalize the inbox row and clear its lease through `tx` with the same ownership and `clock_timestamp()` lease predicate, throwing to roll back if exactly one row is not updated (`now()` is transaction-start time and must not be used for this end-of-transaction expiry check).
- Use `tx` for every query inside the callback—never the outer `db`—and make no SDK, HTTP, logging-drain, or other external call while the transaction owns a pool client. The locked inbox row prevents a concurrent reclaim from committing over this worker; the final predicate and rollback protect against an already-expired/lost lease.
- A single ownership-gated SQL CTE may replace this callback later as a measured optimization, but it is not required by the current driver. A user mutation and terminal inbox update must never be separate commits.
- Unsupported/invalid events need no user mutation and may use one direct terminal `UPDATE`, but it must still compare `status`, lease token, and unexpired lease. Every success, ignore, invalid, retry, and dead-letter transition is ownership-fenced and clears the lease only for the current claimant.
- If the projection transaction throws, its user and terminal changes roll back together. Classify the error only after rollback, then use a separate token-fenced update to reschedule/dead-letter it. If the database is unavailable or ownership has already changed, leave the lease for the sweeper to expire/reclaim.

No cache invalidation is needed because `getSignedInUser()` is deliberately uncached and session-backed. If a cached local-user query is introduced in later work, design invalidation for every trigger context (webhook, cron, reconciliation, and manual replay) instead of assuming a Server Action's `updateTag()` is available.

### Milestone 3 verification

- Create inserts an active local projection.
- Update-before-create inserts it successfully.
- A newer update changes selected fields.
- An older update after a newer update is a processed stale no-op.
- An older delete after a newer active update is a processed stale no-op.
- Delete-before-create creates a tombstone.
- A newer delete followed by an older create/update cannot resurrect the user.
- Equal object timestamps use event time, then deletion precedence, deterministically.
- Two distinct events for one user processed concurrently/reversed converge on the freshness winner.
- A duplicate processor invocation cannot apply a side effect twice.
- Two workers cannot own the same unexpired lease.
- An expired lease is recoverable.
- After worker A expires and worker B reclaims a row, A's attempted success **and** failure transitions change neither the user nor inbox.
- A callback-transaction failure leaves neither a projected user change nor a terminal inbox status and returns its client to the shared pool.
- Tests prove every query in the transaction uses `tx`, a zero-row final fenced update rolls back, and each drain processes events sequentially rather than launching unbounded transactions against the two-client pool.

## Milestone 4 — Add internal retries, sweeps, and dead-letter recovery

Centralize a documented/tested retry policy rather than scattering constants:

- base delay: 60 seconds;
- exact delay: `min(6 hours, 60 seconds * 2^(cycleAttempt - 1) * jitterFactor)`;
- bounded `jitterFactor`: 0.8 through 1.2 from an injectable random source so tests are deterministic;
- hard cap: 6 hours after jitter;
- maximum: 20 cycle attempts or 72 hours since `retry_cycle_started_at`, whichever comes first.

Classify failures:

- **Retryable:** transient database/network errors and explicitly classified temporary dependencies. Return the row to `pending`, clear the lease, set `next_attempt_at`, and store a sanitized error code/message.
- **Permanent payload incompatibility:** move directly to `dead_letter`; retrying unchanged bytes cannot fix it.
- **Unsupported event name:** mark `ignored`, not failed.
- **Processor bug/unknown exception:** retry with the normal cap, then dead-letter and alert.

If processing fails, first let any projection transaction roll back, then record retry/dead-letter state with a separate token-fenced update. If the database becomes unavailable or the claim is no longer owned before that update commits, leave the lease to expire; the sweeper will reclaim it.

Add a documented `WORKOS_USER_SYNC_PROCESSING_ENABLED` server flag, defaulting to true, as an emergency receiver-only kill switch. Both `after()` and cron/manual drain paths check it before claiming each batch. When false, the webhook continues verifying, persisting, deduplicating, and returning 200, while no user mutation runs. Toggling it through Vercel environment configuration requires a redeployment; document that operational step and test paused receipt behavior.

### Scheduled sweep

1. Add a URL/header-safe `CRON_SECRET` (at least 32 characters matching a printable random base64url-style alphabet) to env validation and deployment configuration.
2. Add a `GET /api/cron/workos-user-sync` Route Handler that fails closed when the secret is absent or `Authorization` is not exactly `Bearer ${CRON_SECRET}`.
3. Exclude exactly this path plus optional trailing slash from `src/proxy.ts` so coming-soon and AuthKit processing cannot rewrite it. Do not exclude child paths.
4. Use the Node runtime default, no removed `dynamic` export, and an explicit cron `maxDuration` around 60 seconds. Stop claiming new rows by roughly 45 seconds, leaving a safety margin before platform termination; the two-minute lease exceeds the worst allowed per-row work.
5. Have the route call the same server-only drain function as `after()`, with a strict batch/time budget. Classified per-row failures are durably rescheduled and can yield 200 with counts. An unexpected top-level drain/database failure is PII-safely logged and returns 503/5xx so Vercel logs/alerts reflect failure; Vercel itself will not retry the invocation, so the next schedule remains recovery.
6. Merge a production cron entry with schedule `* * * * *` into the existing `vercel.json`, retaining both `$schema` and `"fluid": true`, after confirming the production Vercel plan supports one-minute frequency. Verify deployment output/config still reports Fluid enabled, the Cron Jobs UI registers the schedule, and its production request receives a direct non-redirect response with Vercel's `Authorization` header.
7. Check Deployment Protection, WAF, BotID, and platform redirects for both public endpoints. Cron requests do not follow redirects, and Proxy exclusion alone does not prove reachability.
8. Vercel Cron invokes only a project's Production deployment. A durable staging environment must therefore be either a separate Vercel project whose staging build is its Production deployment or use an authenticated external scheduler. Ephemeral previews may be manually drained for tests, but must be labeled as lacking automatic recovery; do not point a persistent WorkOS staging endpoint at such a preview.
9. If the deployed production or persistent-staging environment cannot run every minute, this is a launch stop condition: configure an authenticated durable external scheduler or adopt Vercel Queues as the wake-up transport. A daily sweep is not acceptable recovery for identity synchronization.

Overlapping cron invocations are acceptable because database leases provide concurrency control. Keep each drain at concurrency one, claim no more than ten rows at a time, cap a run at 100 rows or the shorter execution budget, and let the next invocation continue a backlog. The two-client pool remains available to concurrent receivers/page reads instead of being monopolized by one drain.

### Replay

Provide a command that requeues one retained `dead_letter` row by local receipt UUID (with WorkOS event ID as a convenience lookup when present). It must:

- require the row to exist and still have `raw_payload`/parsed payload data;
- preserve lifetime attempt/error evidence, increment `replay_count`, and set `last_replayed_at`;
- reset only `cycle_attempt_count` and `retry_cycle_started_at`, then set it due now under the current `processor_version`;
- pass through normal validation, freshness checks, and claiming; and
- never accept arbitrary unsigned JSON as if it were a WorkOS event.

### Milestone 4 verification

- Backoff grows, caps, and stays inside deterministic jitter bounds in tests.
- Transient failure schedules a retry without losing payload/state.
- Attempt/age exhaustion dead-letters the row.
- A receipt dead-lettered after 20 attempts/more than 72 hours can be deliberately replayed under a new cycle without losing lifetime counts.
- A cron failure does not lose or prematurely terminally mark work.
- Concurrent and duplicate cron invocations are harmless.
- Missing cron configuration/secret fails closed; wrong or absent headers return 401.
- Paused processing still accepts/deduplicates signed receipts and neither `after()` nor cron mutates users.
- Manual replay fixes a formerly incompatible event after the processor changes and remains idempotent.

## Milestone 5 — Backfill, reconciliation, retention, and operations

### Initial backfill and incident reconciliation

Webhooks only cover future changes, so shipping the endpoint without a backfill would omit existing WorkOS users.

Implement an operator command using the installed typed APIs:

- page through `getWorkOS().userManagement.listUsers()`;
- validate/map each returned SDK `User` through the same minimal projection mapper;
- capture an observation timestamp immediately **before each page request**, create a synthetic source ID for that page, and upsert each result through the same four-part source comparison as webhooks;
- for an incident repair, collect active local IDs absent from a complete successful list, capture a new observation timestamp before each `getUser(id)`, and tombstone only a confirmed WorkOS 404;
- for a confirmed 404, conditionally preserve the row's current object watermark, advance `not_found_observed_at` to the request-start observation time, use a synthetic reconciliation source ID, and set `deleted_at` to that observation time; do not apply it over a source observed after the request began;
- never mass-delete based on an incomplete/failed page traversal;
- support dry-run, bounded API retries, progress counts, and a final summary without emails or raw profiles; and
- guarantee by tests that an update/delete webhook created after a reconciliation request began can win, while a delayed pre-barrier webhook cannot overwrite the canonical observation even when its object `updatedAt` exceeds the tombstone's preserved watermark.

Do not put reconciliation-only values into the webhook inbox or invent fake WorkOS event IDs. `app_users.last_source_*` intentionally models either source. Required races include deletion/update during a multi-page scan, a delayed webhook after a page upsert, and a confirmed-404 tombstone racing a new webhook.

Safe launch ordering:

1. migrate the inbox schema and provision `CRON_SECRET`/the processing flag;
2. create the endpoint in the correct WorkOS environment with only the three user events, keeping it disabled while available (or otherwise preventing event-changing traffic during the short setup window);
3. copy the generated signing secret into the matching local/deployment environment, then build/deploy the env-validating receiver/worker code;
4. verify reachability and enable the WorkOS endpoint;
5. run reconciliation **after** webhook enablement, so changes during the scan are also captured;
6. wait for a zero pending backlog and zero unresolved dead letters; and
7. compare remote/local active counts and spot-check source watermarks.

### Retention and privacy

The inbox contains user PII. Never log the raw body, signature header, signing secret, full user object, or email.

Adopt and document this initial policy:

- retain processed/ignored exact bytes and parsed JSON for 30 days;
- retain unresolved dead-letter bytes/JSON for up to 90 days with an alert requiring resolution;
- after the period, set both `raw_payload` and `payload` to null and `payload_redacted_at = now()` while retaining digest, envelope IDs/type/timestamps, disposition, attempts, and non-sensitive diagnostics; and
- rely on canonical WorkOS reconciliation, not expired signatures, after a payload has been redacted.

Run retention from the scheduled maintenance path in small batches, or a separately authenticated job if it starts competing with event processing. Event processing always has priority.

### Observability

The repository has no configured alert/metrics provider. The implementation baseline is structured PII-safe logs plus database health queries/runbook commands; before production launch, wire the named conditions below into the project's chosen Vercel Observability/log-drain alert destination and verify one test alert. Do not claim alerting is complete merely because `console.error` exists.

Emit structured, PII-safe logs and health summaries for:

- receiver result: accepted, duplicate, signature rejected, persistence failed;
- processing disposition: applied, stale, ignored, retried, dead-lettered;
- local receipt ID, nullable WorkOS event ID/type, cycle/lifetime attempts, processor version, and duration;
- pending count and age of the oldest due event;
- expired leases reclaimed; and
- reconciliation scanned/applied/stale/missing/failed counts.

Alert on:

- any dead-letter transition;
- oldest due event older than five minutes;
- repeated receiver 5xx responses;
- cron absence/failure over several expected intervals; and
- a growing pending backlog.

## Testing plan

Use Bun's test runner for pure and receiver-adapter tests unless a concrete incompatibility requires adding Vitest. Modules marked `server-only` throw under Bun's default conditions, so define scripts with `bun --conditions=react-server test ...` (and equivalent reconciliation/replay commands), or isolate a genuinely environment-neutral core.

Database integration tests must target a disposable Neon branch using both URLs for that same branch: a direct `TEST_DATABASE_URL_UNPOOLED` for migrations and a pooled `TEST_DATABASE_URL` containing `-pooler` for runtime behavior. Never run them against development or production. Prefer a fresh disposable branch per CI run; otherwise use isolated IDs plus explicit cleanup and fail closed unless both URLs are unmistakably marked as the intended test target.

Create a test-only helper that constructs `pg.Pool({ connectionString: TEST_DATABASE_URL, idleTimeoutMillis: 5000, max: 2 })`, passes it to `drizzle-orm/node-postgres`, and returns `{ db, pool }`. Do not import the production singleton into ordinary database tests, do not call `attachDatabasePool` outside a real Vercel request lifecycle, and always `await pool.end()` in test teardown. Separately run a Next integration test with the disposable pooled URL mapped to `DATABASE_URL` so the real `src/data/db.ts` singleton and attachment path are exercised.

### Pure contract tests

- SDK-constrained event names/selected User keys for all three user events
- Loose raw decoder default handling for an unknown event name
- Minimal schema accepts extra envelope and user fields
- Minimal schema rejects a missing/renamed field the projection depends upon
- Missing optional profile fields normalize to null rather than dead-lettering
- Snake_case raw fixture transforms to the stable internal camelCase mutation DTO
- Mapper selects only owned fields
- Webhook/reconciliation freshness tuple, observation-time races, and delete precedence table
- Backoff, jitter bounds, attempt cap, and age cap
- Error classification and sanitization

Keep representative WorkOS fixtures in-repo with synthetic data. These become upgrade-contract tests for `@workos-inc/node`.

### Receiver tests

- Valid signature and exact raw bytes -> 200 plus one inbox row
- Missing/invalid signature -> 400 plus no row
- Valid but too-old signature -> 400 plus no row
- Payload signed before a byte/whitespace change -> rejected
- Oversized payload with absent, accurate, and falsely small `Content-Length` -> 413
- Durable insert failure -> non-2xx
- Duplicate delivery -> 200, delivery metadata only, no state reset
- Same event ID with a different digest -> preserved first payload plus anomaly signal
- Signed malformed JSON/envelope -> durably quarantined by digest plus 200
- Unknown signed event -> persisted and later ignored
- Additive fields -> exact bytes/semantic keys persisted and normal projection succeeds
- Mocked scheduler failure leaves row pending and returns 200

Build valid signatures with the installed WorkOS SDK helpers and a test secret; do not mock away the verification boundary. Inject/mock the scheduler in direct tests because calling real `after()` outside a Next request context throws. Use a running Next integration test for actual response-before-delayed-callback behavior.

### Database/processor integration tests

- Migration and constraints on an empty disposable database
- Create, update, delete, and update-before-create
- Duplicate event ID under concurrency
- Out-of-order/stale update
- Older delete after newer active update
- Delete tombstone plus stale resurrection attempt
- Deleted row clears mirrored PII but retains identity/watermarks
- Equal timestamp tie cases
- Two distinct same-user events processed concurrently in reverse order
- Concurrent claim exclusion and expired-lease recovery
- Old claimant cannot succeed/fail after a token-fenced reclaim
- `node-postgres` callback-transaction rollback, ownership fencing, checked-out-client release, and applied-versus-stale disposition
- Zero-row final fenced update rolls back the user mutation; every transactional query uses `tx`
- Repeated/concurrent work reuses a pool bounded at two clients, and each drain processes its claimed rows sequentially
- Shared client registers one PII-safe idle-pool error listener and no duplicate listener under module reuse
- Retry scheduling, max attempts/age, and dead-letter transition
- Replay after processor version change and an already-expired retry cycle
- Processing kill switch leaves due rows untouched while receipt remains live
- Multi-page reconciliation and confirmed-404/webhook race matrix
- Confirmed-404 barrier blocks a delayed pre-observation update with a higher object watermark, while a later-observed active source can restore and clear the barrier
- Payload retention redaction

### Routing/deployment tests

- `/api/webhooks/workos` and `/api/cron/workos-user-sync` bypass Proxy
- `/api/webhooks/workos/x`, `/api/cron/workos-user-sync/x`, `/api/webhooks/workosa`, `/dashboard`, and `/auth/callback` still match Proxy
- Production coming-soon mode does not rewrite webhook or cron requests
- Cron route rejects a missing/wrong secret
- Cron GET is request-time without a removed `dynamic` export, returns no redirect, and reports top-level drain failure with non-2xx
- Merged deployment configuration retains `$schema` and `fluid: true` while registering the cron

For this installed Next version, the prose docs mention a Proxy matcher test helper name that does not match the exported package symbol. Inspect `next/experimental/testing/server` before importing it; `unstable_doesMiddlewareMatch` is the installed 16.3 export. If that experimental helper fails under the chosen test runner, verify with running-app integration requests instead of weakening the matcher test.

### End-to-end verification

- Expose local development through an HTTPS tunnel and send each available WorkOS Dashboard test event.
- Confirm the request returns quickly, the inbox row appears once, and the local projection reaches the expected terminal state.
- Manually retry one Dashboard delivery and confirm idempotency.
- Force one transient processor failure and observe app-owned retry/recovery.
- Exercise a dedicated persistently scheduled staging environment separately; WorkOS's staging delivery retry window is much shorter than production.
- Smoke-check the production deployment's registered one-minute cron and direct authenticated response. Scheduling itself cannot be proven with `next dev`/`vercel dev`.

## Rollout and rollback

### Rollout

1. Preserve and review the current Fluid database baseline: one module-global attached `pg.Pool`, `idleTimeoutMillis: 5000`, `max: 2`, pooled runtime URL, `node-postgres` adapter, and `vercel.json` with `fluid: true`.
2. Generate and review the committed schema migration using the intended environment's direct `DATABASE_URL_UNPOOLED` while no webhook traffic reaches the new route.
3. Apply that migration through the direct URL, then verify runtime traffic still uses the corresponding pooled `DATABASE_URL`; validate host shapes without logging either secret.
4. Register only `user.created`, `user.updated`, and `user.deleted` in the WorkOS Dashboard, keep the endpoint disabled during setup where supported, and obtain its signing secret.
5. Provision `WORKOS_WEBHOOK_SECRET`, `CRON_SECRET`, and the processing flag in every relevant deployment environment **before** the env-validating build.
6. Deploy and verify webhook/cron routes bypass Proxy and all platform protection layers; verify Fluid remains enabled after the cron merge and a durable scheduler exists in production and persistent staging.
7. Enable/send WorkOS test events, then run the canonical backfill.
8. Monitor accepted/processed counts, pending age, retries, dead letters, pool wait/timeout signals, and Neon pooler client/server connection and queue metrics before considering the sync live. Tune `max: 2` only from that evidence and remember total possible application clients scale approximately with active Fluid instances times two.

### Rollback

- If projection logic is unsafe, set the processing kill switch false and redeploy so both `after()` and cron/manual paths pause while the receiver continues durably accepting events.
- Disable the WorkOS endpoint only when signature verification/receipt persistence itself is unsafe; otherwise keeping ingestion live avoids an event gap.
- When disabling/updating cron, use the Vercel dashboard or deploy updated cron configuration. An Instant Rollback does **not** update active cron jobs.
- Roll back application code without dropping tables or raw events.
- Correct the processor, increment `processor_version`, replay affected retained events, then reconcile against WorkOS.
- Schema/table removal is a separate, explicitly approved destructive migration and is not part of an application rollback.

## Acceptance criteria

- [ ] The endpoint enforces a streaming byte cap and verifies the exact collected bytes through the installed WorkOS SDK before parsing or trusting fields.
- [ ] It returns 200 only after the verified receipt is durably inserted/quarantined or identified as an existing duplicate.
- [ ] It subscribes to and projects only the three AuthKit user events.
- [ ] Event IDs/content-digest fallbacks are database-enforced dedupe keys; duplicates cannot reset processing, and digest mismatch is signaled.
- [ ] Exact verified bytes plus parsed `unknown` JSONB are stored with bounded PII retention.
- [ ] SDK user-event/User types constrain selected keys and event names; loose raw schemas provide real runtime narrowing and allow additive fields.
- [ ] Signed malformed receipts are quarantined; unknown event names are stored/ignored; missing required projection fields are dead-lettered.
- [ ] Create/update are cross-source freshness-protected upserts and delete creates a PII-minimized, non-resurrectable tombstone.
- [ ] Processing is outside the delivery response and recoverable without `after()`.
- [ ] Token-fenced leases, capped exponential backoff with jitter, cycle/lifetime counters, attempt/age caps, and replay are implemented and tested.
- [ ] Each supported user mutation and inbox terminal disposition runs atomically in one short, ownership-fenced `node-postgres` Drizzle callback transaction; rollback, lost-lease, and client-release paths are tested.
- [ ] The existing module-global `pg.Pool`, immediate `attachDatabasePool`, pooled Neon runtime URL, five-second idle timeout, two-client maximum, Node runtime, and `fluid: true` deployment setting are preserved; exactly one sanitized idle-pool error listener is added, and no application path creates/closes a per-invocation pool.
- [ ] Each drain processes transactions sequentially against the shared pool; any future concurrency increase requires an explicit limiter and production evidence.
- [ ] Resolved ORM/Kit RC versions are compatible, runtime Drizzle config avoids unsupported `{ schema }`, and committed migrations use `drizzle-kit migrate` through a direct CLI-only URL.
- [ ] Exact webhook and cron paths bypass Proxy and coming-soon rewriting without broadly bypassing API security.
- [ ] Production and persistent staging each have an automatic recovery scheduler; previews are not misrepresented as durable.
- [ ] Existing WorkOS users are backfilled after webhook enablement, and reconciliation's observation/watermark/confirmed-absence-barrier races are tested.
- [ ] A processing kill switch pauses every processor trigger while leaving durable receipt active.
- [ ] Logs and stored errors exclude raw payloads, signatures, secrets, and user PII.
- [ ] Structured health logging/database queries are wired to a verified production alert destination for backlog, receiver failures, cron absence, and dead letters.
- [ ] Tests cover verification age/bytes, durability-before-ack, duplicates/anomalies, malformed/additive fields, unknown events, ordering, tombstones, lease fencing, retries, replay, reconciliation races, and recovery.
- [ ] `bun run test`, integration tests, `bun run typecheck`, `bun run check`, and `bun run build` pass.

## Reference map for the implementer

- Supplied WorkOS guide: `/Users/jpetrillo/.codex/attachments/f8b7f130-a8d6-412e-9f57-e383bbc1310f/pasted-text.txt`
- WorkOS webhook guide: <https://workos.com/docs/events/data-syncing/webhooks>
- WorkOS event catalog: <https://workos.com/docs/events>
- Installed WorkOS SDK types/runtime:
  - `node_modules/@workos-inc/node/lib/factory-DmBBe791.d.mts`
  - `node_modules/@workos-inc/node/lib/factory-BdXIrbcU.mjs`
- Installed Next.js docs:
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- Project database/Fluid setup:
  - `src/data/db.ts`
  - `docs/drizzle-neon-database.md`
  - `vercel.json`
- Installed `node-postgres`/Fluid behavior:
  - `node_modules/drizzle-orm/node-postgres/driver.d.ts`
  - `node_modules/drizzle-orm/node-postgres/session.d.ts`
  - `node_modules/drizzle-orm/node-postgres/session.js`
  - `node_modules/@vercel/functions/db-connections/index.d.ts`
  - `node_modules/@vercel/functions/db-connections/index.js`
- Drizzle with Neon: <https://orm.drizzle.team/docs/connect-neon>
- Drizzle transactions: <https://orm.drizzle.team/docs/transactions>
- Neon on Vercel Fluid: <https://neon.com/docs/guides/vercel-connection-methods>
- Neon connection pooling/PgBouncer behavior: <https://neon.com/docs/connect/connection-pooling>
- Vercel Fluid connection pooling: <https://vercel.com/kb/guide/connection-pooling-with-functions>
- Vercel `attachDatabasePool`: <https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#attachdatabasepool>
- Vercel Fluid configuration: <https://vercel.com/docs/fluid-compute>
- Vercel Cron security/behavior: <https://vercel.com/docs/cron-jobs/manage-cron-jobs>
