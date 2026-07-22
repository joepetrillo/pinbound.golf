# Build resumable post-signup onboarding

> **Executor instructions:** This is a product-foundation plan, not a marketing-page pass. Read it fully before implementation. Preserve all pre-existing worktree changes, especially the current auth/dashboard work. Use the installed Next.js documentation in `node_modules/next/dist/docs/` before writing framework code. Do not treat an external integration as connected until it has actually been verified.
>
> **Planning baseline:** commit `2bd7f8b` plus the live dirty worktree on 2026-07-17. The live routes are `/auth/sign-up`, `/auth/sign-in`, `/auth/callback`, and `/dashboard`; older completion notes mentioning `/get-started` or `/callback` are historical. Run `git status --short` first and compare every in-scope file with the current-state notes below. A conflicting user edit is a STOP condition.

## Status

- **Priority:** P0
- **Effort:** XL, delivered as four independently verifiable milestones
- **Risk:** HIGH — authentication, tenant isolation, persistent state, and activation all meet here
- **Depends on:** existing WorkOS AuthKit setup; a provisioned Postgres database; approved activation/legal copy before public go-live
- **Planned from:** `docs/pinbound-product-context.md`, master document v1.5, the current repository, installed Next.js 16.3 preview docs, and installed WorkOS SDK docs

## Outcome

After a user signs up, Pinbound sends them through one authenticated app-entry resolver. A new workspace owner begins onboarding; a returning owner resumes at the last valid unfinished step; an activated user reaches the dashboard. Refreshing, closing the browser, signing out and back in, or opening the flow on another device restores server-persisted progress and saved values.

The flow covers the minimum path from account creation through course configuration, connections, private testing, and explicit activation. Every step says whether its answers can be changed later, who may change them, and whether a live change is immediate, validated before publishing, or requires another test. Pinbound-owned safety behavior is visibly locked.

## Current state

- `/auth/sign-up` calls WorkOS `getSignUpUrl()` without an explicit return destination.
- `/auth/callback` uses bare `handleAuth()`, returns to `/`, and `src/proxy.ts` then sends a signed-in root request to `/dashboard`.
- `/dashboard` is a placeholder that reads only the WorkOS user. It does not consult a local user, organization, workspace, role, or onboarding record.
- `src/proxy.ts` only invokes AuthKit for `/dashboard` and `/`. Its broad matcher does **not** make AuthKit session headers available to future `/onboarding` or `/settings` routes.
- There is no database driver, ORM, schema, migration, durable user/workspace model, audit log, settings surface, onboarding code, test runner, or WorkOS membership webhook.
- `src/app/(app)/layout.tsx` is a bare main element and is a clean base for the product shell.
- `next.config.ts` enables Cache Components and partial prefetching. Personalized data must remain request-time data behind focused Suspense boundaries.
- The Contact form already demonstrates the preferred Zod + Server Action + `useActionState` + accessible field-error pattern. Onboarding must add authentication, tenant authorization, transactions, autosave, and optimistic concurrency.
- Production `COMING_SOON_MODE` currently rewrites all product/auth requests. Keep using previews with that flag disabled until launch; do not weaken the launch gate accidentally.

## Decisions this plan makes

### Persistence and tenancy

1. Use **Neon Postgres with Drizzle ORM and versioned migrations** for the first implementation. Postgres is the Pinbound source of truth for product data and onboarding progress.
2. WorkOS owns authentication, sessions, organizations, memberships, and role claims. Pinbound owns workspace state, facilities, courses, configuration, connection state, audit history, and activation.
3. A WorkOS organization maps 1:1 to a Pinbound workspace at launch. The schema still allows a user to belong to multiple workspaces.
4. Workspace membership is verified locally for every protected read and write, using the authenticated WorkOS user/organization as input. Proxy is only an optimistic redirect layer; it never replaces DAL authorization.
5. A new signup is not assumed to have a WorkOS `organizationId`. The first workspace step creates and links the WorkOS organization and owner membership idempotently. A user arriving through an existing organization/invitation is recognized and must never create a duplicate workspace.

### Resumability

1. The database is authoritative. Do not use component state, a numeric URL index, cookies, `localStorage`, or `sessionStorage` as the source of onboarding progress.
2. Use stable string step keys, a workflow schema version, per-step/per-entity progress, and a dependency graph. Newly added required steps and changed prerequisites can invalidate downstream completion safely.
3. Persist both `lastVisitedStepKey` and computed completion state. `/onboarding` derives a canonical resume target; it does not blindly trust a saved pointer.
4. Save partial, non-secret drafts to the server after a short debounce and on blur. `Continue` performs full validation and completes the step transactionally. Include an explicit `Save and exit` action.
5. Use revision numbers for optimistic concurrency. A stale save from a second tab returns a conflict instead of silently overwriting newer data.

### Activation

1. Onboarding completion, external connection status, and live activation are separate concepts. A vendor can remain pending for days without erasing other progress.
2. Permit an explicitly selected **information-and-routing-only** activation while a tee-sheet authorization is pending, provided phone, disclosure, handoff, fallback, knowledge, eval, and private-test gates pass. Transactional tee-sheet capabilities stay disabled until their own connection, policy, verification, and eval gates pass.
3. Activation is recorded per phone line and enabled capability set. The initial workspace onboarding is complete when the first production phone line activates.
4. The 30-day pilot starts once, in the same idempotent operation/event that first activates a production phone line. It never starts at signup, test-agent provisioning, reconnect, or reactivation.
5. The kill switch remains an immediate owner action after activation and never waits on a configuration publish pipeline.

### Post-onboarding editing

Build onboarding forms as reusable settings sections. The wizard adds sequencing, progress, and launch gates; it must not create a second set of schemas or mutation logic that diverges from Settings.

## Product lifecycle

```text
WorkOS signup/sign-in
        |
        v
/auth/callback: idempotently upsert local user
        |
        v
/dashboard: resolve app destination
        |
        +-- no workspace/org context ------> /onboarding/workspace
        +-- incomplete owner -------------> /onboarding/<canonical-step>
        +-- incomplete staff -------------> /onboarding/waiting
        +-- active workspace/line ---------> /dashboard

Onboarding: draft -> external pending where needed -> ready for test
           -> private test/evals -> ready for activation -> active
```

The resolver must also handle multiple memberships: honor a valid WorkOS organization context; otherwise show a workspace chooser rather than guessing.

## Data model

Use relational tables for tenancy and operational entities, typed/versioned JSONB only where the configuration shape benefits from versioning, and a dedicated secret reference for credentials.

| Model | Purpose / important constraints |
| --- | --- |
| `app_users` | `workos_user_id` unique; minimal profile mirror and timestamps |
| `workspaces` | unique nullable `workos_organization_id` during provisioning; name, lifecycle, first activation, trial start; revision |
| `workspace_memberships` | user/workspace unique; `owner` or `staff`; WorkOS membership ID/status; local authorization mirror |
| `facilities` | workspace-scoped identity, address, timezone, website; never globally addressable without workspace scope |
| `courses` | facility-scoped course name, hole count, active/draft state |
| `phone_lines` + `phone_line_courses` | facility-owned line and the courses it serves; public, transfer, fallback and provider metadata kept distinct |
| `tee_sheet_connections` + mappings | vendor/operator connection plus internal-course-to-vendor-course mapping and capability state |
| `course_configuration_versions` | draft/published/retired typed payloads for hours, seasons, rates, rules, amenities, knowledge, terminology, and guided voice config |
| `temporary_conditions` | immediate operational updates with start and required expiration timestamps; separate from long-lived config versions |
| `onboarding_runs` | one initial run per workspace; schema version, overall status, last visited/activity, completion timestamp |
| `onboarding_step_progress` | unique run + step key + scope type/id; status, revision, completion/invalidated timestamps, non-secret draft payload |
| `integration_connections` | voice, telephony, tee sheet, website import; independent status, external IDs, masked metadata, last verification/error |
| `provisioning_jobs` / outbox | idempotent external work and retries outside database transactions |
| `activation_records` | phone line, capability snapshot, approver, config version, test/eval evidence, activated/paused timestamps |
| `audit_events` | actor, workspace, action, resource, safe before/after summary, correlation/idempotency key; never raw credentials |

Required connection statuses: `not_started`, `pending_user`, `pending_provider`, `verifying`, `connected`, `action_required`, `failed`, and `disconnected`. Required step statuses: `not_started`, `in_progress`, `complete`, `skipped`, `blocked`, and `needs_review`.

Add foreign keys, workspace-scoped unique constraints, and indexes for the resume resolver. Every multi-tenant query must receive the authorized workspace from the DAL, not accept a workspace ID from a hidden field or client prop as proof of access.

## Step registry and onboarding content

Present four human-sized phases while keeping stable substep URLs. Each substep may have workspace-, facility-, course-, or phone-line-scoped instances.

| Phase | Step key | Required content and behavior |
| --- | --- | --- |
| Workspace | `workspace` | Workspace name; create/link WorkOS organization and owner membership; explain that name and team can change later |
| Workspace | `facility` | Facility name, address, timezone, website; support more than one facility without requiring it |
| Workspace | `courses` | One or more courses, course names and hole counts; select which courses belong to the initial launch |
| Course setup | `course-basics` | Hours/seasons, rate classes, cart/walking rules, amenities; repeat per launch course |
| Course setup | `booking-policies` | Booking window, allowed phone actions, cancellation/no-show rules, group thresholds, reservation-verification policy; owner-only after setup |
| Course setup | `knowledge` | FAQs, URLs/documents, unpublished rules, and explicit review of any imported facts; imported content remains draft until approved |
| Calls | `routing` | Public number, departments, immediate human handoff, non-looping transfer and fallback destinations, optional VIP list, coverage mode |
| Calls | `voice-greeting` | Voice, pronunciation/terminology, tone, and editable greeting fields; preview the platform-composed locked AI/recording disclosure |
| Connections | `tee-sheet` | Vendor, operator/course mapping, desired capabilities, authorization or credentials; show pending/action-required states and allow progress elsewhere |
| Launch | `review` | Completeness/readiness summary, capability limitations, editability summary, and approved legal/commercial acceptance when available |
| Launch | `test` | Sync config, provision private agent, run global and course-specific evals, complete owner private test call, record explicit approval |
| Launch | `activate` | Final phone/fallback/capability checks, select initial line and coverage, activate idempotently, and start pilot exactly once |

Website import is an accelerator, not a prerequisite for the first vertical slice. Manual structured entry must work first. Temporary conditions are introduced during onboarding but managed from the dashboard/settings because they are time-sensitive operating data, not a durable setup requirement.

The step registry owns labels, slugs, scope, prerequisites, optionality, edit destination, required role, and invalidation dependencies. Do not scatter ordering rules through pages.

## Resume algorithm

`resolveOnboardingDestination()` must:

1. Load the authenticated local user, active WorkOS organization context, local membership, workspace, onboarding run, required entity instances, and step progress.
2. Reconcile workflow schema/version changes and mark any newly required or dependency-invalidated step `needs_review`.
3. Reject a requested step that belongs to another tenant, requires a different role, or has unmet hard prerequisites.
4. Prefer the saved last-visited step when it is still accessible and unfinished.
5. Otherwise select the earliest actionable `needs_review`, `in_progress`, or incomplete required step from the dependency graph.
6. Do not trap the user on an external `blocked` step while independent steps remain. If only external blockers remain, route to a status screen with the owner action, provider state, retry path, and what can be done meanwhile.
7. Send completed initial onboarding to `/dashboard`; send non-owner members of an incomplete workspace to `/onboarding/waiting`.

A user may revisit completed steps. If an edit changes a prerequisite—course count, timezone, booking policy, phone mapping, or connection capability—the same transaction invalidates only the dependent steps and records why.

## Editability and publishing policy

Every onboarding page shows one of these messages near its primary form action: `Change anytime in Settings`, `Owner-only after setup`, `Changes require validation before going live`, or `Managed by Pinbound for safety`.

| Class | Examples | Who | Live behavior after onboarding |
| --- | --- | --- | --- |
| Immediate operational | Temporary conditions with expiry; kill switch | Staff for approved conditions; owner for kill switch | Validate, audit, apply immediately; kill switch always wins |
| Editable + validated sync | Facility facts, hours, rates, amenities, FAQs, pronunciation, voice, editable greeting fields | Owner; staff only for explicitly allowed day-to-day facts | Create new draft version, validate/sync, atomically publish, retain previous version for rollback |
| Owner-only + retest | Booking/cancellation/verification rules, permitted tee-sheet actions, routing/fallback, VIP bypass, coverage, phone and course mappings | Owner | Keep current live version until targeted eval/verification passes and owner publishes |
| Owner-only account | Billing, retention/deletion choices within legal limits, member invitations | Owner | Apply through dedicated account workflows; audit all changes |
| Platform locked | AI + recording disclosure, immediate human-request behavior, no spoken card data, tee sheet as source of truth, server-side policy checks, verification floor, idempotency/audit | Nobody in customer UI | Render as locked explanatory controls; never accept client overrides |
| Guarded/support workflow | Ownership transfer, deleting the last active course/line, number porting, destructive workspace deletion | Owner plus recent auth and confirmation; support/provider where required | Dedicated workflow, impact preview, safe fallback/rollback; never a casual settings toggle |

Server-compose the final opening from the protected disclosure template and editable course fields. Do not store or expose a raw system-prompt editor.

## Implementation milestones

### Milestone 1: Durable tenant and resume foundation

1. Add Neon/Drizzle dependencies, `DATABASE_URL` validation, `drizzle.config.ts`, schema modules, migration scripts, and a lazily initialized `server-only` database getter. Do not initialize the database client at module scope.
2. Add the tenancy/onboarding/audit tables above and seed a versioned step registry in code, not as mutable database rows.
3. Create a server-only auth/DAL boundary that:
   - calls `withAuth({ ensureSignedIn: true })`;
   - upserts the local user idempotently;
   - resolves WorkOS org context to a local membership/workspace;
   - enforces owner/staff and resource scope;
   - returns minimal DTOs only.
4. Change `/auth/callback` to use an explicit `/dashboard` return path and an idempotent local-user synchronization hook. Callback retries must not duplicate records.
5. Expand `src/proxy.ts` so `/dashboard`, `/onboarding`, `/settings`, workspace selection, and future protected app endpoints receive AuthKit handling. Keep database queries out of Proxy.
6. Turn `/dashboard` into the canonical server-side app-entry resolver before rendering the real dashboard.
7. Implement workspace bootstrap: create a provisional local workspace, create the WorkOS organization using the workspace UUID as external ID/idempotency key, create the owner membership, link locally, and switch/refresh the session into the organization. Reconcile partial failure by external ID.

**Gate:** a new signup reaches `workspace`; a returning incomplete owner reaches the saved step; an activated seeded user reaches dashboard; an invited member does not create a second workspace.

### Milestone 2: Resumable onboarding vertical slice

1. Build the product shell in `(app)` with authenticated user/workspace area, progress navigation, `Save and exit`, sign-out, loading/error boundaries, and `noindex` metadata.
2. Add `/onboarding` as a resolver and `/onboarding/[step]` as stable named substeps validated against the registry.
3. Implement shared onboarding/settings schemas, DTOs, thin Server Actions, and form components. Reuse the existing Field/accessibility conventions and keep Client Components at the form boundary.
4. Implement non-secret autosave with:
   - partial Zod schemas;
   - 750–1000 ms debounce plus blur flush;
   - `Saving`, `Saved`, and retryable failure status announced with `aria-live`;
   - server revision/expected-revision checks;
   - no advancement until full step validation succeeds.
5. Add `workspace`, `facility`, and `courses` end to end. Support back navigation, direct-link guards, multiple courses, refresh, sign-out/sign-in, and another-device resume.
6. Add a visible secondary Sign in entry on the marketing shell when the app is ready, so returning users are not forced through the signup CTA.

**Gate:** automated browser coverage proves values and exact step resume after refresh, close/reopen, logout/login, and a failed validation. Two tabs produce a visible conflict rather than lost data.

### Milestone 3: Course, calls, and connection setup

1. Implement `course-basics`, `booking-policies`, and `knowledge` using versioned course configuration drafts. Require explicit review/provenance for imported data.
2. Implement `routing` with structured destinations and a loop-detection/verification state. Never infer that the public number is a safe transfer destination.
3. Implement `voice-greeting` with a locked disclosure preview and guided fields only.
4. Implement capability-driven connection adapters and status UI for website import, ElevenLabs, telephony, and tee sheets. External calls run from idempotent jobs/outbox processing, not inside the form transaction.
5. Store raw integration credentials only through an approved encrypted credential-store abstraction. Draft JSON, logs, audit payloads, rendered HTML, and client props may contain only masked metadata/reference IDs.
6. Add development/test adapters that can exercise pending, action-required, connected, timeout, and failure states. They must be impossible to select as production connections.
7. Add configuration invalidation rules and a publish pipeline that keeps the last known-good live version active until sync/validation passes.

**Gate:** every step resumes independently; external pending/failure survives sessions; users can continue unrelated work; no secret is persisted in step drafts; tenant-isolation tests cover every new entity.

### Milestone 4: Readiness, testing, activation, and Settings

1. Build one readiness service used by Review, Test, Activate, and later Settings. It returns machine-readable gate IDs, status, explanation, owner action, and evidence—not duplicated booleans in pages.
2. Implement agent configuration sync and private-test orchestration behind provider interfaces. Record the exact configuration version used by each test/eval result.
3. Require global evals, course-specific golden calls, verified transfer/fallback behavior, a private owner test call, and explicit owner approval before activation.
4. Implement capability-specific activation. Information/routing-only mode may activate without a connected tee sheet; transaction toggles remain unavailable until their stricter gates pass.
5. Make activation and first pilot start idempotent. Repeated submissions, timeouts, and retries cannot create duplicate provider resources or reset `trial_started_at`.
6. Add `/settings` destinations using the same forms, schemas, DAL operations, versioning, audit, sync, and retest policy. Add temporary conditions and the kill switch to the operational dashboard.
7. Add WorkOS organization/membership webhook synchronization with signature verification before shipping team invitations or relying on role changes.
8. Add onboarding funnel/error events without form payloads or PII: started, resumed, step saved/completed/invalidated, externally blocked, test ready/failed, activation ready/succeeded/failed.

**Gate:** a workspace can configure, leave, resume, test, explicitly activate, and later edit each allowed class with the promised publish behavior. The pilot starts exactly once. Locked behaviors cannot be changed through UI or direct action calls.

## Expected file areas

Exact names may adjust to existing conventions, but keep responsibilities separated:

- `drizzle.config.ts`, database migrations, `src/db/client.ts`, `src/db/schema/*`
- `src/data/auth.ts`, `src/data/workspaces.ts`, `src/data/onboarding.ts`, `src/data/configuration.ts`, `src/data/readiness.ts`
- `src/lib/onboarding/step-registry.ts`, `resolver.ts`, `schemas/*`, `permissions.ts`
- `src/lib/integrations/*`, credential-store abstraction, provisioning/outbox processor
- `src/app/auth/callback/route.ts`, `src/proxy.ts`
- `src/app/(app)/layout.tsx`, `/dashboard`, `/onboarding`, `/settings`, workspace chooser
- focused onboarding/settings form components and any missing shadcn primitives
- unit, database-integration, action, and Playwright browser tests
- `package.json`, `bun.lock`, `.env.example`, and `src/env.config.ts`

Database and provider modules must import `server-only`. Server Actions stay thin, validate all input, re-authorize the actor/resource, return minimal form state, and delegate database work to the DAL. Never mutate during a Server Component render.

## Verification matrix

### Resume and navigation

- New signup → callback → workspace step.
- Refresh mid-step after autosave → same step and values.
- Close browser, return through Sign in → same canonical step and values.
- Direct later-step URL with unmet prerequisite → canonical allowed step.
- Back-edit a prerequisite → only dependent steps become `needs_review`.
- Completed onboarding visit to `/onboarding` → dashboard.
- External pending step → status persists while unrelated setup remains usable.
- Added workflow schema requirement → existing incomplete run cannot bypass it.

### Auth, roles, and isolation

- Unauthenticated product request → WorkOS sign-in.
- Owner can complete and activate; staff cannot mutate owner-only steps or activate.
- Invited member with org context links to the existing workspace.
- User in workspace A cannot read, infer, save, or activate any workspace B resource, including through altered route params/action payloads.
- Proxy redirects are backed by DAL checks in pages, actions, jobs, and handlers.

### Persistence and failure

- Duplicate callback/workspace submit does not duplicate user, org, membership, workspace, facility, course, agent, or activation.
- WorkOS success followed by DB failure reconciles by external ID/idempotency key.
- Database/provider timeout shows retryable state without advancing the step.
- Stale second-tab revision produces a conflict and reload/merge path.
- Secrets never appear in drafts, audit events, action results, client props, HTML, analytics, or logs.

### Activation and later edits

- Trial is null throughout signup/onboarding/testing and set once on first production activation.
- Information-only activation cannot call transactional tools.
- Connected transaction capability cannot activate before adapter, policy, verification, and eval gates pass.
- Safe factual edit publishes only after successful validation/sync and can roll back.
- Policy/routing/integration edit keeps the last live version until retest and owner publish.
- Temporary condition expires automatically; kill switch takes effect immediately.
- Locked disclosure and safety rules reject direct mutation attempts.

### Quality gates

- Pure tests cover the step graph, resume selection, invalidation, readiness, role matrix, and activation idempotency.
- Database tests cover transactions, constraints, tenant isolation, revisions, and outbox retries.
- Browser tests cover the resume matrix at mobile and desktop widths with keyboard and screen-reader semantics.
- `bun run typecheck`, `bun run check`, `bun run build`, migration validation, unit/integration tests, and Playwright all pass.

## Rollout order

1. Ship Milestone 1 behind an internal/preview feature flag and seed only test workspaces.
2. Ship Milestone 2 to internal accounts and prove resumability before adding the long forms.
3. Add Milestone 3 one step at a time, keeping unimplemented connections honestly `Not available` or `Pending`; never fake success.
4. Exercise Milestone 4 with mock/test providers, then real provider sandboxes.
5. Allow a design-partner workspace only after tenant isolation, fallback, test/eval, activation, and kill-switch gates pass.
6. Disable `COMING_SOON_MODE` for product routes only as part of an explicit launch change after the public site and product truth agree.

## Done criteria

- [ ] Signup and sign-in both reach one deterministic app-entry resolver.
- [ ] Progress and partial non-secret values survive refresh, browser exit, sign-out/sign-in, and device changes.
- [ ] WorkOS org/workspace provisioning is idempotent and invite-aware.
- [ ] Stable step keys, dependency invalidation, external pending states, and schema upgrades work.
- [ ] Initial required workspace/facility/course/call/connection/test/activation flow exists.
- [ ] Every step accurately labels editability and revalidation behavior.
- [ ] Settings reuse the same schemas and mutations as onboarding.
- [ ] Platform safety behavior is uneditable and enforced server-side.
- [ ] Owner/staff permissions and tenant isolation are enforced in the DAL and mutations.
- [ ] First production activation starts the pilot once; signup never does.
- [ ] Audit, configuration versioning, rollback, and activation evidence exist.
- [ ] Automated and manual verification gates pass with no sensitive-data exposure.

## STOP conditions

- The executor cannot provision an isolated Postgres development/preview database or a migration/restore path.
- WorkOS organization, role, invitation, or callback behavior differs materially from the installed SDK and current provider documentation.
- A requested implementation would trust Proxy, layouts, route params, or client-supplied workspace IDs as the sole authorization control.
- Raw external credentials would need to enter a generic onboarding draft or logs before encrypted credential storage is approved.
- Legal/commercial copy for consent, retention, deletion, recording, or activation has not been approved; build the state/gate but do not enable public activation.
- Real telephony cannot prove caller-ID preservation, non-looping human transfer, fallback, and kill-switch behavior.
- A real tee-sheet capability cannot be verified against an authorized sandbox; keep it pending/disabled rather than simulating production readiness.
- Existing user work overlaps an in-scope file in a way that cannot be safely reconciled.

## Follow-on plans after this one

- Team invitation/ownership-transfer UX and full WorkOS role administration.
- Website ingestion automation and per-source provenance review.
- Production ElevenLabs, telephony, and tee-sheet adapter implementations where not already delivered separately.
- Billing/payment-method collection, pilot conversion, usage/overage workflows, and seasonality handling.
- Abandoned-onboarding reminders based on `last_activity_at`, with consent and rate limits.
- Additional-facility/course/phone-line setup using the same settings sections rather than rerunning initial onboarding.
