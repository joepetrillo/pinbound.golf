# Build resumable post-signup onboarding

> **Executor instructions:** This is a product-foundation plan, not a marketing-page pass. Read it fully before implementation. Preserve all pre-existing worktree changes, especially the concurrent Drizzle work. At the start of every milestone, run `git status --short`, inspect the live implementation, and reconcile this plan with changes that landed after the planning snapshot. A conflicting user edit is a STOP condition.
>
> Use the installed, version-matched Next.js guides in `node_modules/next/dist/docs/` and the installed WorkOS SDK source/docs before writing framework or provider code. Do not infer current APIs from memory. Do not treat an external integration as connected until it has been verified against an authorized sandbox.
>
> **Planning snapshot:** branch `staging`, HEAD `0efb1ff`, plus the live dirty worktree observed on 2026-08-12. At that point `package.json`, `bun.lock`, and `src/data/db.ts` contained expected in-progress Drizzle/Neon work from another agent. That work is an input to this plan, not something to overwrite or duplicate.

## Status

- **Priority:** P0
- **Effort:** XL, delivered as a preflight and four independently verifiable milestones
- **Risk:** HIGH — authentication, tenant isolation, durable drafts, external provisioning, and activation meet here
- **Start dependency:** the concurrent Drizzle handoff has finished and passes the transaction-capability gate below
- **Later launch dependencies:** approved activation/legal copy and verified telephony/provider behavior; these do not block the tenant foundation or first resumable vertical slice
- **Primary references:** `docs/pinbound-product-context.md`, the current repository, installed Next.js 16.3 docs, installed AuthKit 4.3.1 docs/source, and installed Drizzle/Neon driver behavior

## Outcome

After authentication, Pinbound sends every user through one server-side app-entry resolver. A new owner can name and provision a workspace, configure the first facility and its launch courses, leave, and resume on any device. An invited member links to the existing workspace without creating a duplicate. An activated workspace reaches the dashboard.

The database is authoritative. Once the UI reports **Saved**, refresh, browser close/reopen, sign-out/sign-in, and another-device sign-in restore the exact normalized values, step instance, and revision. Two tabs cannot silently overwrite each other. External pending states survive sessions without trapping the user when independent work remains.

The complete flow covers course configuration, phone routing, connections, private testing, and explicit activation. Every step explains who may edit it later and whether a change is immediate, validated before publish, or requires a retest. Pinbound-owned safety behavior remains visibly locked and server-enforced.

## Scope boundaries

The first vertical slice supports **one initial facility and multiple launch courses**. The schema and registry remain capable of additional facilities, but adding them is a post-onboarding Settings workflow and is not required to pass Milestone 2.

Website import is an accelerator, not a prerequisite. Manual structured entry must work first. Production ElevenLabs, telephony, and tee-sheet adapters are not part of the early milestones unless their sandbox contracts have actually been verified. Milestone 3 builds provider contracts, honest status UI, and impossible-in-production test adapters; Milestone 4 may exercise activation in a sandbox without enabling public production activation.

Billing, payment collection, team administration beyond membership reconciliation, ownership transfer, and full account deletion are follow-on work.

## Current state to preserve

- `/auth/sign-up` and `/auth/sign-in` already pass `returnTo: "/dashboard"`.
- `/auth/callback` already uses `handleAuth({ returnPathname: "/dashboard" })` and a safe error redirect, but it does not synchronize a local identity or organization membership.
- `src/proxy.ts` already runs `authkit()` and forwards trusted AuthKit headers through its broad matcher. Only the signed-out redirect predicate is limited to `/dashboard`; future app routes do not need a second matcher, but they do need to be added to an explicit protected-path predicate.
- `/dashboard` renders a WorkOS-only account placeholder. It has no local user, workspace, membership, onboarding, or activation resolver.
- `src/features/user/user-queries.ts` deliberately performs uncached request-time AuthKit work behind Suspense and currently calls `connection()` for the SDK's time-dependent cookie unsealing.
- `src/app/(app)/layout.tsx` is a synchronous bare shell and must not become a layout-level authorization gate.
- Cache Components and partial prefetching are enabled. Auth/session reads stay dynamic; reusable authorized database presentation reads use explicit cache contracts.
- The Contact form demonstrates the preferred `next-safe-action` + React Hook Form adapter + Zod + accessible `Field` pattern. It does not use raw `useActionState`.
- `DATABASE_URL` validation, Neon dependencies, Drizzle ORM, and an initial shared database client were being added concurrently at the planning snapshot. Their final paths and behavior must be inspected at handoff.
- A concurrent Drizzle/Neon guide and WorkOS user-webhook plan may also land before implementation. Reuse their final client, `app_users`, durable webhook receipt/lease machinery, migration paths, and routes where compatible; extend them for organization/membership events instead of creating a second database client or webhook inbox.
- There is no committed onboarding schema, local tenancy model, workflow registry, audit/outbox foundation, Settings surface, membership webhook processing, Vitest/Playwright setup, or test scripts yet.
- Production `COMING_SOON_MODE` is a browser launch wall. Preserve its decision before AuthKit/session work, but explicitly exempt only the exact machine endpoints required for foundation services (`/api/webhooks/workos` and the selected signed cron path). Those handlers remain closed by raw-body signature or `CRON_SECRET`, method, and rate/size checks. Add a separate server-only `ONBOARDING_ENABLED` rollout flag; do not make ordinary product/browser routes reachable through the exemption.

## Product and authorization decisions

### Sources of truth

1. WorkOS owns authentication, sessions, organizations, memberships, and role claims.
2. Postgres owns the local identity mirror, workspace lifecycle, facilities, courses, configuration, workflow progress, external-operation state, audit history, and activation.
3. A WorkOS organization maps 1:1 to a Pinbound workspace at launch. A user may belong to multiple workspaces.
4. Users are keyed by `workos_user_id`; never merge identities by email.
5. Proxy is an optimistic redirect/header layer only. Secure authorization runs at the closest feature query, mutation, job, and route handler.

### Fail-closed workspace context

Ordinary workspace access requires all of the following:

1. an authenticated WorkOS user;
2. a session `organizationId` equal to `workspaces.workos_organization_id`;
3. an active local membership for that user and workspace;
4. a recognized local role mapping; and
5. the required permission satisfied by both the current WorkOS claim and the local mirror.

Unknown roles, inactive memberships, stale/mismatched organization context, and provider/local disagreement deny access while reconciliation runs. Foreign-tenant resources return the same not-found outcome as a missing resource so IDs cannot be inferred. A known in-tenant resource with an insufficient role returns forbidden. Activation and other owner-sensitive operations refetch canonical WorkOS membership state rather than trusting an old mirror.

Use four explicit server-only capabilities:

- `requireSignedInWorkOSUser()` — dynamic AuthKit session only; valid for callback recovery before a local row exists.
- `requireLocalUser()` — dynamic AuthKit session plus an active, non-deleted local user projection; a retained deleted/tombstoned row is not an actor; valid before a workspace exists.
- `requireWorkspaceContext()` — active session organization plus matching local active membership, with an optional required role.
- resource guards — derive the workspace from the authorized context and query every target with both `workspace_id` and resource ID.

All four capabilities are read-only. Missing local state routes through `/auth/recover`; no Server Component render silently upserts identities or memberships. The recovery page and its dedicated safe-action client use `requireSignedInWorkOSUser()`, never `requireLocalUser()`. Only that explicit recovery command may create the missing local identity/membership state.

### Deterministic app-entry resolution

`/dashboard` is the single authenticated app entry. Resolve destinations in this order:

1. Missing local identity after a valid session → `/auth/recover`.
2. Session organization present and matching a verified active local membership → select that workspace.
3. Session organization present but provider/local state is missing or mismatched → `/workspaces` in a fail-closed recovery state; never bootstrap a new workspace.
4. No session organization and zero active local memberships → `/onboarding/workspace`.
5. No session organization and one or more active local memberships → `/workspaces`, even when there is only one, so organization switching is explicit and verified.
6. Selected workspace whose initial onboarding run is `complete` (set by the first production-line activation) → render the real dashboard; workspace lifecycle becomes `active` in that same finalization transaction.
7. Selected workspace with an incomplete initial run and actor owner → canonical concrete onboarding step instance.
8. Selected workspace with an incomplete initial run and actor staff → `/onboarding/waiting`.

The `/workspaces` UI submits a full-page POST/navigation to a dedicated organization-switch Route Handler. That handler reauthenticates, derives the local user, refetches the selected canonical WorkOS membership, reauthorizes the target, and only then calls installed `switchToOrganization()` with a trusted return path to `/dashboard`. It never accepts a local workspace ID as proof that the user may switch to its WorkOS organization. Do not call this helper from a Server Action: installed AuthKit 4.3.1 may redirect to external hosted auth for SSO/MFA, which fails inside an action fetch.

The bootstrap page may be shown from local state, but its Continue action is the final provisioning authority. Before reserving a new organization, it must list the signed-in user's canonical active WorkOS memberships using the installed paginated API. If an eligible provider membership exists but is not mirrored locally, reconcile it and route to `/workspaces`; if the canonical check is unavailable, fail closed with a retryable state. A webhook/callback delay must never allow an invited user to provision an unrelated owner workspace.

### Provisional workspace authorization

The `workspace` step exists before a workspace-scoped onboarding run can exist. Persist it in a user-scoped, revisioned `workspace_bootstrap_attempts` row. Only the authenticated local user who owns that attempt may read or mutate it. A provisional workspace may be accessed only through bootstrap/recovery commands by its recorded creator; it is not an ordinary authorized workspace, and a provisional local owner row never substitutes for an active WorkOS membership.

### Resumability

1. Do not use component state, a numeric URL index, cookies, `localStorage`, or `sessionStorage` as durable progress.
2. Use stable string step keys, a registry version/hash, concrete scoped step instances, revisions, and a dependency graph.
3. Persist a cursor to a concrete progress row, not only a step key. Repeated course/facility/phone-line steps must resume the correct entity.
4. Generic draft storage accepts only strict, versioned, non-secret allowlisted payloads.
5. Before completion, the step draft is authoritative for incomplete values. `Continue` validates the entire snapshot, writes normalized canonical domain rows, clears the draft overlay, and completes the progress row in one transaction. A revisit begins from canonical domain state; a new draft overlay becomes resumable until the edit is completed.
6. External connection status is independent from step completion. A pending provider cannot erase completed unrelated work.

### Activation

1. Onboarding completion, provider connection status, readiness, and live activation are separate states.
2. Information-and-routing-only activation may be selected while tee-sheet authorization is pending, but only after phone, disclosure, handoff, fallback, knowledge, eval, and private-test gates pass. Transactional capabilities remain disabled until their own connection, policy, verification, and eval gates pass.
3. Activation is per phone line and immutable configuration release. Initial onboarding completes when the first production line activates.
4. The 30-day pilot starts exactly once in the operation that first activates a production line. It never starts at signup, test-agent creation, reconnect, or reactivation.
5. The owner kill switch remains immediate and never waits on a configuration publish pipeline.

## Architecture contract

### Feature and route ownership

- `src/app/**/page.tsx` and layouts are synchronous composition surfaces. They import feature components/skeletons, place `<Suspense>` and `SectionErrorBoundary`, resolve generated route-prop promises at the page boundary, and never import `*-queries`, authorize, fetch, mutate, or define domain UI.
- `src/features/user/` owns the dynamic AuthKit/local-identity boundary and callback/recovery synchronization.
- `src/features/workspace/` owns workspace membership, chooser/bootstrap, and the initial facility section.
- `src/features/course/` owns courses and course configuration.
- `src/features/onboarding/` owns the workflow registry, concrete instances, cursor, progress, resume/invalidation logic, and wizard composition—not duplicate copies of workspace/course/connection schemas.
- Later connection and activation work gets feature-owned `*-queries.ts`, `*-actions.ts`, schemas, cache contracts, components, and types.
- Reusable Settings sections remain in their domain feature. Onboarding sequences those sections and records workflow completion; context-specific thin actions may differ because onboarding completion and post-launch publish/retest semantics differ.
- `src/data/` is reserved for shared secret-backed provider clients, including the landed Drizzle client. `src/lib/` holds cohesive non-domain infrastructure such as the safe-action clients, credential abstraction, and provider-neutral external-operation runner.
- Adopt the Drizzle handoff's actual client/schema/migration paths. Do not create a parallel `src/db` or second database client merely because an older draft named one.

All query, provider, provisioning, delivery, and worker modules that touch server data or secrets import `server-only`. Action files match their feature folder and begin with `"use server"`. Client-safe schemas/DTO types remain importable without pulling in server modules.

### Route composition

- `(app)/layout.tsx` stays synchronous. It may render authenticated account/workspace slots as nested async Server Components behind focused Suspense boundaries, but it never awaits the session at the top or gates `children`.
- `/dashboard` renders a neutral `AppEntry` boundary. Do not leave a dashboard-specific heading outside it, because that heading would flash before redirects to onboarding or recovery.
- `/onboarding` is a resolver route.
- `/onboarding/waiting` and `/onboarding/status` are explicit fixed-path routes. Their personalized dynamic bodies render under page-owned Suspense; “fixed-path” does not mean statically personalized content.
- `/onboarding/[step]` handles singleton steps.
- `/onboarding/[step]/[scopeId]` handles repeated facility/course/phone-line instances.
- Pages use generated `PageProps<"/route">`, remain synchronous, and resolve `params.then(...)` inside page-owned Suspense. Feature components receive plain `stepKey` and `scopeId`, never raw route props.
- The singleton `[step]` route exports `generateStaticParams()` with every singleton slug from the finite registry, and a registry test asserts the exact set. The scoped route does not invent build-time scope IDs. Do not add `dynamicParams`.
- Unknown registry slug → `notFound()`. A foreign scope → not-found. A known in-tenant step with the wrong route shape or unmet prerequisite → redirect to the canonical permitted instance. While the overall run is incomplete, a user may revisit accessible completed steps. Once the run is complete, `/onboarding` and every step route redirect to `/dashboard`; later edits begin in Settings.
- Features export their real skeleton at the end of the same component file. Pages own shaped Suspense fallbacks and `SectionErrorBoundary`; use segment `error.tsx` only for unrecoverable failures.

### Render and cache contract

- AuthKit/session access and active-membership resolution are deliberately uncached request-time work below focused Suspense. Preserve the installed SDK's `connection()` workaround unless version-matched docs/source make it unnecessary.
- Use React `cache()` only for proven same-render deduplication of dynamic auth/context work.
- After `requireWorkspaceContext()` authorizes the request, a presentation query may call an internal cached loader keyed only by primitive authorized IDs. Reusable loaders declare `"use cache"`, an explicit `cacheLife`, and feature-local tags.
- Cookies, headers, `withAuth`, `connection()`, authorization decisions, and raw client-supplied IDs never enter a shared cache scope.
- Security, revision, prerequisite, workflow-completion, and activation decisions read current rows inside the mutation transaction; they never trust a cached DTO.
- Server Actions call `updateTag()` after a committed read-your-own-writes mutation. Signed webhooks/route handlers call `revalidateTag(tag, "max")`. `refresh()` is only for a deliberately dynamic untagged read.
- Do not use legacy `dynamic`, `revalidate`, `fetchCache`, or `unstable_noStore` escape hatches under Cache Components, and do not double-cache a component whose query already owns caching.

### Mutation and safe-action contract

- Client form leaves are the smallest practical `"use client"` boundary and import feature Server Actions directly.
- Server Component queries may use `withAuth({ ensureSignedIn: true })`. Server Action middleware must call `withAuth()` without `ensureSignedIn`; the installed SDK warns that external redirects from an action fetch can cause CORS failures. A missing action session returns a typed reauthentication outcome whose client performs a full-page navigation to trusted `/auth/sign-in`. The normal authenticated action client requires a local actor; a narrowly scoped recovery client requires only the signed-in WorkOS user and exposes only the idempotent sync command. The same restriction applies to installed `switchToOrganization()`: use it only in a full-page, server-reauthorized Route Handler, not a Server Action.
- Auth middleware may supply a minimal local actor, but each domain operation still reauthorizes current workspace, role, resource scope, prerequisites, and revision.
- Every action uses input and output schemas and returns minimal typed outcomes. Expected field/root problems use next-safe-action validation errors. Conflicts and reauthentication are typed business outcomes. Unexpected failures remain generic server errors.
- Framework navigation errors from `redirect()`, `notFound()`, `forbidden()`, and `unauthorized()` propagate through middleware and any `executeAsync` wrapper. Do not catch and convert them into generic errors.
- Do not enable experimental `authInterrupts` solely for this feature. Foreign resources use `notFound()`; an authenticated in-tenant actor without the required role receives an explicit access-denied UI or typed action outcome. If the project separately adopts `forbidden()` or `unauthorized()`, follow their installed configuration and propagation requirements.
- Callback, signed webhook, explicit Server Action, and worker paths own writes. Server Component queries and destination resolvers are read-only.

## Persistence contract

### Transaction-capable Drizzle is non-negotiable

The installed `drizzle-orm/neon-http` driver's interactive `db.transaction()` throws `No transactions support in neon-http driver`. Neon HTTP batch calls are not a substitute for the callback transactions, conditional updates, row locks, and rollback behavior required here.

At the Drizzle handoff, use the transaction-capable transport documented by the final handoff. For this app's normal Node.js/Vercel Fluid runtime, prefer Drizzle's `node-postgres` adapter with a reusable `pg.Pool` and Vercel pool lifecycle integration; Neon Pool/WebSocket is an acceptable verified alternative when TCP is unavailable. Do not keep the HTTP adapter for these operations merely because `db.batch()` can atomically execute a predeclared statement list. Prove with integration tests that:

1. an intentionally thrown error rolls back every write;
2. `SELECT ... FOR UPDATE` or the chosen conditional-update strategy behaves correctly;
3. exactly one of two concurrent compare-and-swap updates wins; and
4. migrations and application queries use the same schema definitions.

### Structural tenant integrity

- `workspaces` is the tenant root. Every workspace-descendant table carries a non-null `workspace_id`.
- Explicit user/provider-scoped exceptions are `app_users`, user-owned `workspace_bootstrap_attempts`, user-owned `bootstrap_mutation_receipts`, user-owned `bootstrap_audit_events`, and provider-owned `workos_webhook_events`. They use non-null alternative owner keys, matching foreign keys/uniqueness, and dedicated authorization; do not add a nullable `workspace_id` and call it tenant enforcement.
- Each workspace-descendant table exposes `UNIQUE(workspace_id, id)` so children can use composite foreign keys.
- Every cross-entity relation includes `workspace_id` in its foreign key—for example `(workspace_id, facility_id)` and `(workspace_id, course_id)`—so the database rejects cross-tenant mappings even if application code is wrong.
- Add indexes for every foreign key and resolver predicate; Postgres does not create foreign-key indexes automatically.
- DAL predicates always include the authorized `workspace_id`; a hidden field or client prop never proves tenancy.
- Use database constraints for enum-like status values, revision floors, state/timestamp consistency, unique active records, and idempotency keys.

### Foundation models (Milestones 1–2)

| Model | Required purpose and constraints |
| --- | --- |
| `app_users` | Reuse the shared unique `workos_user_id` projection, active/deleted state, source-freshness barriers, minimal profile mirror, and timestamps; email is never an identity key |
| `workspace_bootstrap_attempts` | User-scoped initial workspace draft; one active initial attempt per user; revision, request hash/idempotency data, provisioning state, optional provisional workspace, safe error code |
| `workspaces` | Unique nullable `workos_organization_id`; provisional creator, name, lifecycle, revision, first activation and trial timestamps |
| `workspace_memberships` | `UNIQUE(workspace_id, app_user_id)` and unique nullable WorkOS membership ID; provider status, mapped role, provider-updated and synced timestamps |
| `facilities` | Workspace-scoped name, address, timezone, website; first UI creates one, schema allows many |
| `courses` | Workspace + facility scoped; name, hole count, launch order, draft/active state |
| `onboarding_runs` | `UNIQUE(workspace_id, run_kind)`; registry version/hash, status, run revision, concrete `last_visited_progress_id`, activity/completion timestamps; cursor constrained to this same run |
| `onboarding_step_progress` | Run + step + typed scope, status, revision, safe draft payload/schema version, dependency fingerprint, completion/invalidation data |
| `bootstrap_mutation_receipts` | `UNIQUE(app_user_id, mutation_id)` plus non-null bootstrap-attempt/user foreign keys, target, request hash, safe typed result, timestamps; used only before ordinary workspace authorization exists |
| `bootstrap_audit_events` | Append-only non-null bootstrap-attempt/user foreign keys, action, safe allowlisted summary, correlation/mutation ID |
| `mutation_receipts` | Workspace-scoped `UNIQUE(workspace_id, mutation_id)`, actor, target, mutation kind, request hash, safe typed result, timestamps; supports exact retry replay |
| `external_operations` | Workspace-scoped outbox/operation model created only after a provisional workspace root exists; kind, checked `queued`/`leased`/`retry_wait`/`succeeded`/`dead_letter` status, safe payload, request hash, provider idempotency key, attempts, availability/lease, sanitized error code, result reference |
| `workos_webhook_events` | Reuse/extend the shared unique WorkOS receipt model with event/resource identity, verified minimal payload or protected raw payload, processing state/attempts/lease; supports replay and out-of-order handling |
| `audit_events` | Append-only actor kind/ID, workspace, action, resource, safe allowlisted summary, correlation/mutation ID; never raw credentials or provider errors |

Do not model onboarding scope as an unchecked polymorphic `scope_type/scope_id` pair. Give progress rows nullable typed `facility_id`, `course_id`, and—when phone-line steps are enabled in Milestone 3—`phone_line_id`, with:

- a database `CHECK` allowing zero or exactly one typed scope reference;
- composite workspace foreign keys for each populated scope;
- `UNIQUE(run_id, step_key) WHERE facility_id IS NULL AND course_id IS NULL AND phone_line_id IS NULL` for singleton rows; and
- `UNIQUE(run_id, step_key, facility_id) WHERE facility_id IS NOT NULL`, with equivalent course and phone-line partial unique indexes for their scoped shapes.

The code registry and transactional domain command enforce which scope kind each step key permits; do not duplicate mutable registry rules in hand-written SQL. Add each typed scope column, entity table, composite foreign key, and partial index in the same migration before enabling that scope in the registry; do not leave an unconstrained future-ID column.

Give progress rows `UNIQUE(workspace_id, run_id, id)`. Constrain the run cursor with a composite foreign key from `(workspace_id, id, last_visited_progress_id)` to progress `(workspace_id, run_id, id)`, so a cursor cannot point at another run in the same workspace.

The run cursor points to the concrete progress row. Deterministic instance ordering is registry order, then facility/course/line launch order, then stable ID as a tie-breaker.

Required step statuses are `not_started`, `in_progress`, `complete`, `skipped`, `blocked`, and `needs_review`. Store completion schema version, dependency fingerprint, invalidation reason/event, and enforce valid timestamps per state.

### Later operational models (Milestones 3–4)

| Model | Required purpose and constraints |
| --- | --- |
| `phone_lines` + `phone_line_courses` | Facility-owned line and served courses; public, transfer, fallback, coverage, and provider metadata remain distinct |
| `integration_connections` + mappings | One connection status source for voice, telephony, tee sheet, and website import; tee-sheet-specific mappings hang from it rather than competing with another connection table |
| `course_configuration_versions` | Draft/published/retired typed payloads for hours, seasons, rates, rules, amenities, knowledge, terminology, and guided voice configuration |
| `temporary_conditions` | Immediate operational updates with required start and expiration; separate from durable configuration versions |
| `configuration_releases` | Immutable aggregate of exact course, routing, voice, line, and mapping versions used for sync/test/activation |
| sync/test/eval/approval evidence | Normalized evidence referencing the immutable release and provider result references |
| `activation_records` | Phone line, immutable release, enabled capabilities, approver/evidence, idempotency key, activation/pause timestamps |

Required connection statuses are `not_started`, `pending_user`, `pending_provider`, `verifying`, `connected`, `action_required`, `failed`, and `disconnected`. Only trusted adapter/reconciliation code may set verified/enabled capabilities or `connected`; client input may set desired capabilities only.

## Milestone 2 field contracts

Apply Unicode NFC, trim outer whitespace, and collapse internal whitespace runs for human-readable names before validation/storage. Preserve the normalized display value and derive a lowercase normalized key for uniqueness checks. Draft schemas accept unfinished values; Continue requires the following exact normalized snapshot.

### Workspace

- `name`: 2–100 Unicode characters after normalization.
- The user-scoped bootstrap attempt is the only autosave target; no workspace or WorkOS resource is created until Continue.

### Initial facility

- `name`: 2–100 characters.
- `address`: structured `{ line1, line2?, locality, region, postalCode, countryCode }`; `line1`, `locality`, `region`, and `postalCode` are required; address lines max 120, locality/region max 80, postal code max 32; country is uppercase ISO 3166-1 alpha-2 and defaults to `US` in the UI without being hard-coded in persistence.
- `timezone`: required canonical IANA identifier accepted by the server runtime's `Intl.DateTimeFormat`; store the canonical identifier, never a raw UTC offset.
- `websiteUrl`: optional absolute `https:` URL, max 2048 characters; strip fragments, lowercase the host, remove the default port, and preserve path/query. Empty input stores null.

### Initial courses

- One to 12 rows. Each row carries a stable client-row UUID for draft/error identity; canonical course IDs are server-generated and returned/mapped after completion. The client-row UUID never proves resource access.
- `name`: 1–100 characters; names are unique within the facility by normalized lowercase key, enforced both in the schema and database.
- `holeCount`: one of `9`, `18`, `27`, or `36` for the first release.
- `includeInInitialLaunch`: boolean; at least one course must be selected.
- `launchOrder`: derived from submitted row order and stored densely from zero; do not accept a separate client authority for ordering.
- Removing a draft-only row removes it from the snapshot. Removing a previously completed course requires an impact confirmation, cannot remove the final launch course, and transactionally soft-archives/excludes it plus invalidates its scoped downstream progress; never hard-delete dependent configuration or evidence.

## Step registry and canonical routes

The code-owned, versioned registry is immutable for a deployment. It owns labels, phase/order, scope, canonical href builder, prerequisites, required role, optionality, editability message, completion schema version, and invalidation dependencies. Do not store ordering rules as mutable database rows or scatter them through pages.

| Phase | Step key | Scope and canonical route | Required content and behavior |
| --- | --- | --- | --- |
| Workspace | `workspace` | User bootstrap: `/onboarding/workspace` | Workspace name; explain that name/team can change later; full Continue starts idempotent WorkOS provisioning |
| Workspace | `facility` | Workspace singleton: `/onboarding/facility` | One initial facility name, address, timezone, website; schema remains multi-facility capable |
| Workspace | `courses` | Facility: `/onboarding/courses/[facilityId]` | One or more courses, names/hole counts, deterministic launch order and initial-launch selection |
| Course setup | `course-basics` | Course: `/onboarding/course-basics/[courseId]` | Hours/seasons, rate classes, cart/walking rules, amenities |
| Course setup | `booking-policies` | Course: `/onboarding/booking-policies/[courseId]` | Booking window, allowed actions, cancellation/no-show rules, group thresholds, verification policy; owner-only after setup |
| Course setup | `knowledge` | Course: `/onboarding/knowledge/[courseId]` | FAQs, URLs/documents, unpublished rules, explicit provenance/review; imports remain draft until approved |
| Calls | `routing` | Facility: `/onboarding/routing/[facilityId]` | Public number, departments, immediate handoff, non-looping transfer/fallback, optional VIP list, coverage mode; creates initial line |
| Calls | `voice-greeting` | Phone line: `/onboarding/voice-greeting/[phoneLineId]` | Voice, terminology/pronunciation, tone, editable greeting fields, locked platform-composed disclosure preview |
| Connections | `tee-sheet` | Facility: `/onboarding/tee-sheet/[facilityId]` | Vendor, course/operator mappings, desired capabilities, authorization/reference; pending states never block unrelated steps |
| Launch | `review` | Workspace singleton: `/onboarding/review` | Readiness summary, limitations, editability summary, approved legal/commercial acceptance when available |
| Launch | `test` | Phone line: `/onboarding/test/[phoneLineId]` | Sync immutable release, provision private test agent, global/course evals, owner private call, explicit approval |
| Launch | `activate` | Phone line: `/onboarding/activate/[phoneLineId]` | Final line/fallback/capability checks, coverage selection, idempotent activation and one-time pilot start |

Temporary conditions are explained during onboarding but managed from dashboard/Settings because they are expiring operational data, not a durable setup prerequisite.

## Pure resume and reconciliation algorithm

`resolveAppDestination()` and `resolveOnboardingDestination()` are read-only. They must:

1. resolve the dynamic authenticated local user and deterministic workspace selection rules above;
2. authorize the active workspace and load the run, required domain entities, concrete progress, and registry metadata;
3. compute effective instances for the current registry, including virtual missing rows and dependency changes, without writing during render;
4. treat a newly required or dependency-invalidated instance as effective `needs_review`, so a stale run cannot bypass a new requirement;
5. reject a requested instance from another tenant, a disallowed role, a wrong scope shape, or unmet hard prerequisites;
6. prefer the saved concrete cursor when that instance remains accessible and unfinished;
7. otherwise select the earliest actionable `needs_review`, `in_progress`, or incomplete required instance in deterministic registry/entity order;
8. skip externally `blocked` instances while independent work remains;
9. route to `/onboarding/status` when only external blockers remain, showing provider state, owner action, retry path, and available work;
10. route incomplete non-owners to `/onboarding/waiting`; and
11. route completed initial onboarding to `/dashboard`.

Before enabling a new registry version, run an idempotent reconciliation command to materialize new instances and persist invalidations. The resolver still computes the effective state defensively until reconciliation finishes. Every subsequent mutation also reconciles its target transactionally, so render-time writes are never required.

`last_visited_progress_id` changes only in explicit actions: autosave, Continue, Back, Save and exit, or a small idempotent post-render visit action after the server-authorized step has rendered. Visit recording may materialize a missing revision-0 progress row with a conflict-safe insert, but it never increments the step revision or changes draft/status/completion fields. A GET/render never writes.

When a completed prerequisite changes, the same completion transaction compares normalized semantic fingerprints, invalidates only dependent instances, stores the reason/event, and appends an audit record. A stale autosave arriving after completion cannot regress the row because its expected revision no longer matches.

## Exact draft and completion contract

### Inputs and results

Autosave and completion use a full safe step snapshot, not a patch:

```text
Draft input
  mutationId: UUID
  target: { stepKey, scopeId? }
  expectedRevision: integer >= 0
  values: complete client snapshot allowed to be unfinished

Draft result
  saved    { revision, savedAt }
  unchanged { revision, savedAt: timestamp | null }
  conflict { currentRevision }
  auth_required { signInPath }

Complete input
  same envelope, with values validated by the full completion schema

Complete result
  completed { revision, nextHref }
  conflict  { currentRevision }
  auth_required { signInPath }
```

Revision `0` means no accepted draft/completion write yet; a visit-only progress row may already exist at revision 0. An initial normalized no-op may therefore return `unchanged` with `savedAt: null`, and the client must not announce “Changes saved” until a non-null save time exists. Client target values identify what is requested; the server derives and authorizes the actual workspace/entity and may create a missing registry-valid progress row transactionally. `scopeId` is never proof of access.

The pre-workspace `workspace` target uses the same revision/mutation envelope but authorizes the user-scoped bootstrap attempt instead of a workspace progress row. A successful provisioning command returns `switch_required { switchPath }`; the client performs a full-page POST/navigation to that trusted same-origin switch endpoint, whose handler may redirect through hosted auth and ultimately returns to `/onboarding/facility`. An expected external delay returns `provisioning_pending { operationId, statusHref: "/onboarding/workspace" }`; a retryable terminal failure returns `provisioning_failed { operationId, retryAfter? }`; a canonical existing invitation returns `existing_membership { chooserHref: "/workspaces" }`; and an unavailable canonical membership check returns `membership_check_unavailable { retryAfter? }` without creating local/provider resources. The workspace route renders the attempt's provisioning state; the generic workspace-authorized `/onboarding/status` route is not used before membership exists.

The draft schema is strict and purpose-built for incomplete form values. Do not blindly call `.partial()` on the completion schema: present empty strings, repeaters, conditional fields, and normalization often need different rules. Unknown keys and credential-like fields are rejected. The tee-sheet credential flow bypasses generic draft storage and returns only an opaque credential reference plus masked metadata.

### Transaction algorithm

Before opening a transaction, action middleware resolves the dynamic AuthKit session. Any required canonical WorkOS membership list/fetch also happens before the transaction. In particular, workspace Continue exhausts the installed API's relevant active-membership pages before it may reserve a provisional workspace: an existing eligible membership is reconciled and routed to the chooser, while timeout/provider failure returns the fail-closed `membership_check_unavailable` outcome. No AuthKit/provider/network call may hold a database transaction open.

For every accepted draft or completion mutation, one transaction uses `bootstrap_mutation_receipts`/`bootstrap_audit_events` for the user-scoped `workspace` target and `mutation_receipts`/`audit_events` for every workspace-scoped target:

1. locks/rechecks the current local actor and authorizes either the actor-owned bootstrap attempt or the current local workspace membership/role/resource/prerequisites;
2. hashes the normalized request and checks the selected receipt table;
3. returns the stored terminal result for the same mutation ID + hash, but rejects reuse of an ID with different content;
4. locates or creates the actor-owned bootstrap attempt for `workspace`, or materializes the registry-valid concrete progress row with `INSERT ... ON CONFLICT DO NOTHING` for every workspace-scoped step;
5. conditionally writes where `revision = expectedRevision`; zero updated rows returns `conflict`;
6. writes the safe draft, or for Continue writes normalized canonical domain data, clears the draft overlay, and records completion schema/fingerprint;
7. updates the concrete cursor/activity;
8. invalidates only semantic dependents when required;
9. appends to the selected safe audit table and adds any external-operation rows; and
10. records the typed mutation result before commit.

After a raced initial insert, lock/read the winner and apply the conditional revision update; map the losing writer to typed `conflict`, never an unhandled unique-constraint error. Mutation-receipt insertion follows the same conflict-safe replay discipline.

A `provisioning_pending` receipt is intentionally immutable/non-terminal and references the stable external operation. Replaying its original mutation ID always returns that same pending receipt; it does not secretly perform new work and the runner never rewrites it to failed/succeeded. Poll/reload derives the live provisioning state from the authorized bootstrap attempt plus `external_operations`. The Retry button creates a new mutation ID and calls a dedicated retry command with the stable operation ID; that command reauthorizes ownership, leases or reports the operation's current state, and stores its own exact result receipt. Thus `provisioning_failed` is a terminal result of a retry/status command, not a mutation of the original Continue receipt. Terminal saved, completed, conflict, failed, and activation receipts replay exactly.

An unchanged normalized snapshot may return `unchanged` without incrementing the revision. Every other accepted save/complete increments exactly once. An edited snapshot of a completed step deliberately transitions it to `in_progress`, retains its last completion schema/fingerprint/timestamp as the comparison baseline, and makes downstream instances temporarily non-actionable. The UI offers **Discard draft**, which clears the overlay and restores `complete` without invalidation. Only successful re-completion compares semantic fingerprints and invalidates dependents. This edit overlay applies only while the overall onboarding run remains incomplete; post-onboarding Settings uses configuration versions instead. Provider calls occur after commit through `external_operations`, never inside the transaction.

### Client coordination and accessibility

- Debounce autosave for 750–1000 ms and flush on blur.
- Maintain at most one save in flight. Coalesce later edits into the next full snapshot rather than dispatching parallel saves.
- Use a new mutation ID when normalized values change; reuse the same ID only when retrying the identical snapshot.
- On Continue: cancel the timer, await any in-flight save, stop on failure/conflict, then submit the current full snapshot once with the latest revision. Do not autosave and complete as two racing requests.
- On controlled Back, progress-nav, and Save and exit: flush first and navigate only after success. **Save and exit goes to `/home`**; on failure/conflict it stays on the form.
- Sign out is always available and cannot be held hostage by a database outage or conflict. If dirty, attempt a save first; on failure/conflict show a clear confirmation that signing out discards only unsaved local changes, then allow sign-out without waiting on persistence.
- Browser unload cannot guarantee a Server Action completes. Warn while dirty/saving/failed, and phrase the guarantee as: after the UI reports Saved, close/reopen restores the data.
- Keep typed local values on a retryable failure or conflict. V1 conflict resolution is explicit **Reload latest values**; do not promise an unspecified merge. Block further saves until resolved.
- A stable `role="status"` region exists from first render and announces short polite messages such as “Saving changes” and “Changes saved.” An asynchronous failure/conflict is announced through `role="alert"` (or an equivalent assertive live region) and remains visible as non-color-only UI with Retry or Reload.
- Continue remains enabled until submission coordination starts. Validation failure keeps the user on the same URL, links inline errors, shows a form summary, and focuses the first invalid field.
- Progress is `<nav aria-label="Onboarding progress">` with `aria-current="step"`. Course repeaters use fieldsets/legends and deterministic focus after add/remove.

## WorkOS identity, invitation, and bootstrap flows

### Callback and recovery

Use the installed `handleAuth({ onSuccess })` callback hook to:

1. reconcile `app_users` by WorkOS user ID through the shared freshness-protected mapper, so a stale callback cannot overwrite a newer deletion/tombstone;
2. when `organizationId` is present, fetch/list the canonical WorkOS organization membership;
3. reconcile the workspace by WorkOS organization ID or by the organization's Pinbound external ID;
4. upsert the local membership mirror only after active provider membership is verified; and
5. record safe sync metadata.

The callback already has the correct dashboard return path; do not redo it. Callback sync is idempotent. Complete canonical WorkOS reads before opening the short local upsert transaction. Throw a private typed `LocalIdentitySyncError` only for a failure after AuthKit has saved a valid session; `onError` recognizes that internal type and redirects to `/auth/recover`. Authentication/code/PKCE/state failures retain the current safe public `/home` redirect. `/auth/recover` exposes Retry sync and Sign out. Test both error branches, and never encode error details in the redirect URL. Normal authenticated reads fail closed instead of mutating during render.

Process WorkOS organization/membership webhooks in Milestone 1, because invite-aware authorization cannot wait until activation work. If the concurrent user-webhook foundation has landed, extend its verified receipt, lease, retry, cron, and replay path; do not add a parallel inbox or competing processor. The handler/processor:

- verifies the signature against the raw request body and configured tolerance before parsing/trusting it;
- durably records the unique event before returning 2xx;
- handles organization and membership created/updated/deleted events;
- protects against duplicates and out-of-order delivery using provider timestamps plus a canonical refetch completed outside the local projection transaction;
- retries unresolved events; and
- never enters Proxy's browser sign-in redirect predicate.

### Workspace provisioning saga

The installed SDK supports organization creation idempotency and external-ID lookup, but membership creation has no idempotency request option. Implement this exact repairable sequence:

1. Autosave the workspace name in the user-scoped bootstrap attempt.
2. Before any reservation transaction, list canonical active WorkOS memberships for the signed-in user. Reconcile and route any existing eligible invitation to `/workspaces`; on an incomplete/unavailable provider result, stop with the typed retryable outcome.
3. Only after that check is authoritative, transactionally reserve/reuse one provisional workspace, initial run, stable WorkOS organization idempotency key, and workspace-scoped external operation.
4. Outside the DB transaction, call `createOrganization({ name, externalId: workspace.id }, { idempotencyKey })`.
5. On timeout/conflict/ambiguous result, reconcile with `getOrganizationByExternalId(workspace.id)` instead of creating again.
6. List membership by `(organizationId, userId)`; create it with the configured owner role only when absent. After timeout/conflict, list/fetch canonical state again because `createOrganizationMembership()` has no idempotency-key argument. The canonical refetch must confirm both `active` and the configured owner role/permission. If an existing membership is non-owner, promote it only through the installed supported membership-update API and refetch; if promotion is unavailable or fails, stop in fail-closed recovery and never mirror it locally as owner.
7. Only after active owner membership is confirmed, transactionally link the organization, create/update the local active owner membership, materialize completed workspace progress from the bootstrap attempt, and mark the external operation successful.
8. Return the trusted same-origin switch path. The browser performs a full-page POST/navigation; that Route Handler repeats session, user, canonical active-owner membership, and target authorization before calling installed `switchToOrganization(organizationId, { returnTo: "/onboarding/facility" })` outside database transactions and catch blocks. Allowlisted return destinations are server-owned. Its local or external framework redirect must propagate.
9. The request path may run the claimed operation immediately for responsive onboarding; the same leased runner handles deferred retry. A retry, callback, webhook, or worker can repair durable organization/membership/local-link state from every partial-failure boundary using the same workspace external ID and operation record. Only that live full-page switch handler performs `switchToOrganization()` after durable repair. After background success, `/onboarding/workspace` renders a Continue control (or routes through `/workspaces`) that navigates to it; Server Component render never mutates the browser session.

Invited users with an organization context always take callback/webhook reconciliation. They never enter provisional owner bootstrap for that organization.

### External-operation execution and recovery

Use one server-only leased runner and two invocation paths:

1. After committing an operation, the originating request may call `runExternalOperation(operationId)` immediately for responsive onboarding.
2. A deployment scheduler invokes `GET /api/internal/external-operations` at least once per minute. The route requires `Authorization: Bearer <CRON_SECRET>`, rejects all other callers, is excluded from `isProtectedAppPath()`, and invokes the same runner. Configure the schedule explicitly in the deployment configuration; do not rely on an in-process timer. If the shared WorkOS webhook plan lands first, prefer its already secured cron path/lease runner or one coherently scheduled drain over adding a competing recovery route. Validate `CRON_SECRET` and `WORKOS_WEBHOOK_SECRET` as server-only configuration, refuse a production deployment without them, and use separate non-production values.

The runner claims due rows in a short transaction with `FOR UPDATE SKIP LOCKED`, a random lease owner, and `lease_expires_at`; it commits the lease before any provider call. Provider calls have explicit timeouts and occur outside a transaction. A second short transaction records success or a sanitized failure, increments attempts, and releases/reschedules the lease. Retry transient failures with exponential backoff plus jitter; after eight attempts or a classified terminal error, mark `dead_letter`, retain a safe operator action, and emit an alert. Expired leases are reclaimable.

The runner returns affected feature cache tags. The originating Server Action calls `updateTag()` after success; the signed scheduled Route Handler calls `revalidateTag(tag, "max")` after finalization. Do not allow an unbridged standalone worker to mutate data behind indefinitely cached status DTOs.

Integration tests must prove an operation abandoned after commit is later completed by the signed route, an expired lease is reclaimed, concurrent runners execute one lease at a time, duplicate delivery is idempotent, backoff/dead-letter works, and visible status is revalidated.

## Editability and publishing policy

Every step renders one of: `Change anytime in Settings`, `Owner-only after setup`, `Changes require validation before going live`, or `Managed by Pinbound for safety`.

| Class | Examples | Who | Post-onboarding behavior |
| --- | --- | --- | --- |
| Immediate operational | Expiring temporary conditions; kill switch | Staff for approved conditions; owner for kill switch | Validate, audit, apply immediately; kill switch always wins |
| Editable + validated sync | Facility facts, hours, rates, amenities, FAQs, pronunciation, voice, editable greeting fields | Owner; staff only for explicitly allowed facts | Create draft version, validate/sync, atomically publish, retain rollback |
| Owner-only + retest | Booking/verification rules, permitted tee-sheet actions, routing/fallback, VIP bypass, coverage, line/course mappings | Owner | Keep current live release until targeted verification/eval passes and owner publishes |
| Owner-only account | Billing, retention/deletion choices, invitations | Owner | Dedicated audited account workflows |
| Platform locked | AI/recording disclosure, immediate human request, no spoken card data, tee sheet as source of truth, policy checks, verification floor, idempotency/audit | Nobody in customer UI | Locked explanatory controls; reject direct action calls |
| Guarded/support | Ownership transfer, deleting last active course/line, number porting, destructive deletion | Owner plus recent auth/confirmation; support/provider where required | Dedicated impact/rollback workflow; never a casual toggle |

Server-compose the opening from a protected disclosure template plus editable course fields. Never expose a raw system-prompt editor.

## Implementation plan

### Preflight: accept the Drizzle handoff and add test foundations

1. Wait for the concurrent Drizzle work to finish. Record the actual shared client, schema export, migration directory, configuration, and script paths in the implementation PR notes.
2. Preserve and extend those paths; remove no concurrent work and create no parallel DB client/schema tree.
3. Replace any non-transaction-capable application transport before onboarding code depends on it. Run the rollback, row-lock/conditional-update, and two-writer CAS integration proofs described above.
4. Prove migrations apply from an empty isolated database and that the migration command fails safely on invalid configuration.
5. Add `TEST_DATABASE_URL` validation that refuses the development/preview/production URL and requires an unmistakably isolated test database or Neon branch.
6. Add test infrastructure and scripts: Vitest node tests, Testing Library/user-event where synchronous client behavior needs jsdom, Playwright, and `@axe-core/playwright`; include `test:unit`, `test:integration`, `test:e2e`, and a composed CI command.
7. Apply migrations before integration/E2E tests and reset deterministically between cases.
8. Use a WorkOS test environment with deterministic owner/staff/invited users. Prove the hosted-auth reauthentication mechanism used by the sign-out/sign-in test—seeded password credentials when supported, or a test-mailbox/OTP retrieval API—and create an accepted invitation fixture. Use Playwright storage state for cases that do not test authentication itself. Do not add a production-capable auth bypass. Missing test-tenant credentials or a deterministic re-login path blocks browser gates, not pure/database implementation.
9. Add a server-only `ONBOARDING_ENABLED` rollout flag, default false in production. When false, direct onboarding/workspace-management entry returns the current unavailable/placeholder state, `/dashboard` does not invoke the new resolver, and bootstrap/onboarding/workspace-management Server Actions reject before mutation. Callback recovery and signed webhook reconciliation remain enabled as foundation services. Keep `COMING_SOON_MODE` unchanged.

**Gate:** blank-database migration, rollback, CAS, and URL-safety tests pass; all new test commands exist; the final Drizzle client is demonstrably transaction-capable.

### Milestone 1: durable identity, tenant, and provisioning foundation

1. Add the foundation tables, constraints, indexes, scoped mutation receipts/audits, and external operations; reuse/extend the concurrent WorkOS event inbox and `app_users` projection if they landed first.
2. Add the leased external-operation runner, signed scheduled recovery route, deployment schedule, retry/dead-letter behavior, and cache-tag bridge.
3. Add client-safe role/status schemas and the code-owned onboarding registry/graph. Validate the registry at module/test time: unique keys, valid dependencies, no cycles, valid scopes/routes, at least one singleton static param, and no dependency on a later phase without an explicit exception.
4. Implement read-only `requireSignedInWorkOSUser()`, `requireLocalUser()`, `requireWorkspaceContext()`, and resource guards. Add normal authenticated and recovery-only safe-action clients that do not use `ensureSignedIn` inside actions.
5. Add callback identity/membership synchronization plus the explicit `/auth/recover` route/UI/command path and split error routing.
6. Add signed, durable, replay-safe WorkOS organization/membership webhook processing.
7. Implement the provisional bootstrap draft and full WorkOS organization/membership saga, including outbox recovery and session switching.
8. Implement the workspace chooser query, full-page reauthorized organization-switch Route Handler, and pure app/onboarding destination resolvers.
9. Define an exact `isProtectedAppPath()` for `/dashboard`, `/onboarding`, `/settings`, `/workspaces`, and `/auth/recover`. Keep database work out of Proxy and leave signed webhook/internal-operation handlers outside the browser redirect predicate. Before AuthKit work, the coming-soon decision rewrites every non-exempt browser route but passes through only the exact WorkOS webhook and signed cron machine paths; their handlers enforce signature/secret authentication. Test that the wall still blocks ordinary `/api` and product paths.
10. Replace `/dashboard`'s account heading/placeholder composition with the neutral app-entry boundary behind Suspense; retain the real dashboard view only for the active branch.

**Gate:** service/integration tests prove duplicate callback/bootstrap requests yield one user/workspace/org/membership/run; provider success followed by DB failure repairs by external ID; an abandoned operation resumes through the signed route; an invitation—including the callback/webhook race—links to the existing workspace; session/local mismatches fail closed; webhook duplicates/out-of-order events converge; OAuth failure and post-session local-sync failure take their distinct safe redirects; the coming-soon wall blocks browsers while authenticated machine endpoints remain reachable; Proxy still forwards AuthKit headers and never queries Postgres.

### Milestone 2: first resumable onboarding vertical slice

1. Build the synchronous product shell with async account/workspace slots behind focused Suspense, progress navigation, Save and exit, sign-out, noindex metadata, and route-level unrecoverable error UI.
2. Add `/workspaces`, `/onboarding`, `/onboarding/waiting`, `/onboarding/status`, `/onboarding/[step]`, and `/onboarding/[step]/[scopeId]` with the route contract above; retain and integrate the Milestone 1 `/auth/recover` route rather than re-creating it.
3. Implement the registry resolver component, shaped skeletons, post-render visit recording, direct-link guards, and deterministic canonical hrefs.
4. Add the user-facing workspace bootstrap form/client composition on top of Milestone 1 provisioning/recovery commands, and implement facility/courses schemas, domain commands, DTOs, tagged presentation queries, thin actions, and reusable section components in their owning features.
5. Implement the exact CAS/idempotent full-snapshot autosave and completion contract, accessible statuses/errors/focus, sequential save queue, navigation flush, and reload-only conflict recovery.
6. Support back navigation, one initial facility, multiple ordered courses, course add/remove focus, and prerequisite invalidation.
7. Add a visible secondary Sign in entry to the marketing shell once the app flag is enabled so returning users do not have to use the signup CTA.

**Gate:** browser coverage proves new owner → workspace → facility → courses; invited member → existing workspace; values and exact scoped resume after UI reports Saved, refresh, close/reopen, sign-out/sign-in, and a separate authenticated context; invalid Continue does not advance and focuses the first error; two pages produce a visible conflict and the newer DB value survives; Save and exit reaches `/home` only after a successful save.

### Milestone 3: course, calls, and connection setup

1. Add `course-basics`, `booking-policies`, and `knowledge` using versioned course configuration drafts and explicit import provenance/review.
2. Add `routing` with structured destinations plus loop detection and verification. Never infer that the public number is a safe transfer destination.
3. Add `voice-greeting` with guided fields and a locked server-composed disclosure preview.
4. Add the single connection model, course mappings, credential-reference abstraction, and capability-driven provider interfaces.
5. Run all external calls through idempotent external operations. No provider call occurs inside a form transaction.
6. Store credentials only in the approved encrypted credential abstraction. Drafts, audit, analytics, logs, rendered HTML, and client props contain only opaque references/masked metadata.
7. Add development/test adapters for pending-user, pending-provider, action-required, connected, timeout, failure, and disconnect. Make selecting them in production impossible by construction and test that guard.
8. Add immutable configuration releases for the exact course/routing/voice/line/mapping versions sent to a provider. Implement dependency invalidation and a publish pipeline that leaves the last known-good release active until sync/validation succeeds; do not create a temporary component-level publish model that Milestone 4 replaces.

**Gate:** every concrete scoped instance resumes independently; pending/failure survives sessions while unrelated steps remain usable; generic drafts reject secrets; tenant-isolation and composite-FK tests cover every new entity; production UI never reports a test adapter as a real connection.

### Milestone 4: readiness, private testing, activation, and Settings

1. Build one readiness service used by Review, Test, Activate, and Settings. It returns machine-readable gate ID, status, explanation, owner action, and evidence—not page-local booleans.
2. Extend the Milestone 3 immutable release model with normalized test/eval/approval evidence and activation eligibility; never mutate an already-synced release.
3. Add provider-neutral sync/private-test orchestration and normalized global/course eval, transfer/fallback verification, owner test-call, and approval evidence tied to the release.
4. Require all capability-specific gates before activation. Information/routing-only mode may omit a tee-sheet connection; transaction toggles remain unavailable until their stricter gates pass.
5. Make activation an idempotent external operation. On finalization, lock/revalidate current owner membership, immutable release, evidence, line, capabilities, and onboarding run; finalize activation, set `trial_started_at = COALESCE(trial_started_at, now())`, and on the first production-line activation mark the initial run `complete` with `completed_at`/activity/cursor state in the same transaction. Concurrent first-line activations yield one trial timestamp and one run-completion transition. After commit, invalidate the activation, onboarding-run, and dashboard tags so `/onboarding*` resolves to `/dashboard` immediately.
6. Add `/settings` destinations that reuse domain sections/schemas/commands while honoring immediate, validated publish, and retest policies.
7. Add temporary conditions and the immediate kill switch to the operational dashboard.
8. Add payload-free/PII-free funnel events: started, resumed, saved, completed, invalidated, externally blocked, test ready/failed, activation ready/succeeded/failed.
9. Keep public production activation behind a separate explicit enablement until legal copy and real telephony/fallback behavior pass the launch gates.

**Gate:** in an internal sandbox, a workspace can configure, leave, resume, create an immutable release, test, approve, activate the permitted capability set, and later edit each policy class with the promised behavior. Repeated activation cannot duplicate provider resources or reset the pilot. Locked behaviors reject direct mutation attempts.

## Expected file areas

Exact database paths come from the Drizzle handoff. The application work should converge on:

```text
src/data/
  db.ts                         # landed shared secret-backed client
  <provider clients only>

src/features/user/
  user-queries.ts
  user-sync.ts
  user-actions.ts
  components/

src/features/workspace/
  workspace-queries.ts
  workspace-actions.ts
  workspace-schema.ts
  workspace-cache.ts
  workspace-provisioning.ts
  components/

src/features/course/
  course-queries.ts
  course-actions.ts
  course-schema.ts
  course-cache.ts
  components/

src/features/onboarding/
  onboarding-queries.ts
  onboarding-actions.ts
  onboarding-schema.ts
  onboarding-cache.ts
  onboarding-registry.ts
  onboarding-resolver.ts
  components/

src/features/connection/       # when Milestone 3 begins
src/features/activation/       # when Milestone 4 begins

src/lib/external-operations/
src/lib/credentials/
src/lib/safe-action.ts

src/app/(app)/dashboard/
src/app/(app)/workspaces/
src/app/(app)/onboarding/
src/app/(app)/settings/
src/app/auth/callback/route.ts
src/app/auth/recover/
src/app/auth/switch-organization/route.ts  # full-page, reauthorized POST/navigation
src/app/api/webhooks/workos/route.ts
src/app/api/internal/external-operations/route.ts
src/proxy.ts
vercel.json                     # explicit operation-recovery schedule

tests/unit/
tests/integration/
tests/e2e/
```

Do not create table-shaped feature folders by default. Fold sub-concepts into their owning user-facing domain until they meet the repository's feature criteria.

## Verification matrix

### Entry, resume, and navigation

- Duplicate callback and concurrent workspace submits create exactly one local user, bootstrap attempt, workspace, WorkOS org, active membership, and initial run.
- Session org + verified membership selects that workspace; no org + zero memberships selects workspace bootstrap; no org + memberships selects `/workspaces`; mismatch selects fail-closed recovery.
- Refresh restores the same normalized values/revision and direct `/onboarding` entry resolves to the same concrete instance.
- Close/reopen and another authenticated browser context restore values after Saved.
- Direct access to a later step with an unmet prerequisite redirects to the canonical allowed scoped URL.
- A missing scope for a scoped step redirects to its deterministic next instance; a foreign scope is indistinguishable from missing.
- Back-editing a prerequisite invalidates only semantic dependents.
- A registry-version change affects effective resume immediately without render-time writes and cannot be bypassed.
- Only external blockers remaining routes to `/onboarding/status`; completed onboarding routes to dashboard.

### Autosave, validation, and failure

- Invalid Continue leaves progress incomplete, preserves values/URL, links errors, and focuses the first invalid field.
- Save failure preserves dirty local values and never advances.
- Identical mutation retry replays one stored result; the same mutation ID with a different hash is rejected.
- Two concurrent saves with one revision have exactly one winner; the stale page shows conflict, cannot save again, reloads the new value, and never overwrites it.
- Continue waits for its own in-flight autosave and a late stale save cannot regress a completed step.
- A DB/provider timeout exposes retryable state without claiming success.

### Auth, roles, and isolation

- Signed-out product request goes to WorkOS; signed webhook requests remain signature-authenticated and are never sent to browser sign-in.
- Owner can complete/activate; staff cannot mutate owner-only steps or activate.
- Invited member links to the existing organization/workspace and never provisions another.
- User in workspace A cannot read, infer, save, map, test, or activate a workspace B resource through route params, action input, cached loaders, jobs, or handlers.
- Composite foreign keys reject cross-tenant relationships even in direct SQL tests.
- Membership demotion/deactivation denies immediately after canonical reconciliation; unknown role slugs deny.
- Provisional workspace access is limited to its bootstrap creator and cannot use ordinary workspace queries.

### WorkOS, outbox, and webhook recovery

- WorkOS success followed by DB failure repairs through organization external ID and membership list/fetch.
- Duplicate external-operation delivery does not duplicate provider resources.
- Callback-before-webhook, webhook-before-callback, duplicate event, and out-of-order membership events converge on the same mirror.
- An outbox row is committed atomically with the domain mutation; rollback leaves neither.
- Raw credentials and unsafe provider errors never appear in drafts, receipts, audit, webhook logs, action results, HTML, analytics, or client props.

### Activation and later edits

- Trial remains null through signup/onboarding/testing and is set once at the first production-line activation.
- Simultaneous first-line activations produce one pilot timestamp.
- Information-only activation cannot invoke transactional tools.
- Transaction capabilities cannot activate before adapter, policy, verification, release, and eval gates pass.
- Factual edit publishes only after successful validation/sync and can roll back.
- Policy/routing/integration edit retains the last live release until retest and owner publish.
- Temporary conditions expire; kill switch takes effect immediately.
- Locked disclosure and safety rules reject UI and direct-action mutation.

### Accessibility and quality

- Keyboard tests cover progress, repeaters, validation focus, Retry/Reload, Save and exit, and conflict recovery.
- Automated tests assert roles, names, descriptions, live regions, `aria-current`, error relationships, and axe results at mobile and desktop widths.
- Complete a manual VoiceOver or NVDA smoke test; Playwright does not prove screen-reader usability by itself.
- Run migration validation, `bun run typecheck`, `bun run check`, `bun run build`, unit, integration, and Playwright commands. Async Server Components are verified through browser tests rather than forced into a jsdom unit harness.

## Rollout order

1. Land the transaction-capable Drizzle/test preflight with `ONBOARDING_ENABLED=false`.
2. Ship Milestone 1 to internal/preview environments and seed only test workspaces.
3. Enable Milestone 2 for internal WorkOS accounts and prove resumability/conflicts before adding long forms.
4. Add Milestone 3 one step at a time. Unimplemented connections remain honestly `Not available` or `Pending`; never fake success.
5. Exercise Milestone 4 with test adapters and authorized provider sandboxes.
6. Admit a design-partner workspace only after isolation, fallback, eval, activation, and kill-switch gates pass.
7. Enable public production activation and change `COMING_SOON_MODE` only in an explicit launch change after product, legal, provider, and marketing truth agree.

## Done criteria

- [ ] Signup and sign-in reach one deterministic app-entry resolver.
- [ ] Local identity and invitation reconciliation are idempotent and fail closed.
- [ ] WorkOS organization/workspace provisioning repairs every partial failure without duplicates.
- [ ] Progress and safe partial values survive the promised saved-state resume matrix.
- [ ] Stable scoped instances, revisions, conflicts, invalidation, external pending states, and registry upgrades work.
- [ ] Initial workspace/facility/course/course-setup/calls/connection/review/test/activation flow exists at the supported capability level.
- [ ] Every step accurately labels editability/revalidation behavior.
- [ ] Settings reuse domain schemas/commands/sections rather than cloning onboarding logic.
- [ ] Tenant/role/resource authorization is enforced at the data source and structurally backed by database constraints.
- [ ] Generic drafts, audit, analytics, logs, and client DTOs contain no secrets.
- [ ] Immutable releases/evidence back activation, and the first production activation starts the pilot once.
- [ ] Locked platform behavior is server-enforced and uneditable.
- [ ] Migration, rollback, concurrency, unit, integration, browser, accessibility, typecheck, lint, and build gates pass.

## STOP conditions

### Before Milestone 1

- The Drizzle handoff is still changing in overlapping files or its final transport cannot run interactive transactions.
- There is no isolated Postgres development/test database, migration-from-empty path, or recoverable migration procedure.
- WorkOS owner/staff role slugs, organization-management permissions, invitation behavior, or callback behavior differ materially from installed SDK/provider reality.
- Implementation would upsert during Server Component render or trust Proxy/layout/client workspace IDs as authorization.

### Before the relevant browser gate

- Deterministic WorkOS test users/storage state cannot be provisioned without touching production.
- The planned E2E setup requires a production-capable authentication bypass.

### Before credential/provider milestones

- Raw external credentials would need to enter generic drafts, logs, audit, or unencrypted storage.
- A provider contract cannot be verified in an authorized sandbox; keep it pending/disabled rather than simulating production readiness.

### Before public activation

- Consent, recording, retention/deletion, or commercial acceptance copy is not approved; build/test the gate but do not enable it publicly.
- Telephony cannot prove caller-ID preservation, non-looping human transfer, fallback, and kill-switch behavior.
- Tee-sheet capabilities cannot prove authorized sandbox behavior, idempotency, and verification; keep transactional capabilities disabled.
- Existing user work overlaps an in-scope file in a way that cannot be safely reconciled.

## Follow-on plans

- Additional-facility/course/phone-line setup through Settings.
- Team invitation/ownership-transfer UX and full WorkOS role administration.
- Website ingestion automation and per-source provenance review.
- Production ElevenLabs, telephony, and tee-sheet adapters not separately delivered here.
- Billing, payment method, pilot conversion, usage/overage, and seasonality workflows.
- Consent-aware abandoned-onboarding reminders keyed from last activity.
