# Plan 002: Build Contact and route Get Started into WorkOS

> **Executor instructions**: Follow every step and verification gate. This plan handles user-supplied personal data; do not log or expose it. Stop on any STOP condition and update the plan status in `plans/README.md` when complete.
>
> **Drift check (run first)**: `git diff --stat aeffb3a -- package.json bun.lock src/lib/site.ts 'src/app/(site)/contact/page.tsx' 'src/app/(site)/contact/actions.ts' 'src/app/(site)/contact/contact-form.tsx' 'src/app/(site)/get-started/page.tsx' 'src/app/(site)/privacy/page.tsx' 'src/app/(site)/terms/page.tsx' src/emails/contact-notification.tsx src/emails/contact-acknowledgement.tsx` This compares the planning baseline with the current working tree, including staged and unstaged edits. If an in-scope file changed, compare the excerpts below with live code before proceeding. A material mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-refine-homepage-conversion.md`; finished WorkOS AuthKit setup before the final signup-handoff step
- **Category**: direction / security
- **Planned at**: commit `aeffb3a`, 2026-07-15

## Why this matters

The current Contact and Get Started routes both end in email, so the primary CTA does not behave like product signup and high-intent visitors depend on a local mail client. The agreed launch model gives these routes distinct jobs: Contact is a polished general inquiry form delivered by Resend, while Get Started initiates WorkOS account creation and onboarding. This reduces friction without adding a phone line, scheduler, CRM, or another lead funnel.

## Current state

- `src/app/(site)/contact/page.tsx:14-32` contains one paragraph and a single `mailto:` button.
- `src/app/(site)/get-started/page.tsx:46-110` is a founder-led pilot information page whose only action is a prefilled email.
- `src/lib/site.ts:14-30` defines “Plan your pilot,” `FOUNDERS_EMAIL`, and the generated pilot mailto body.
- `src/app/(site)/privacy/page.tsx:27-36` explicitly says the site does not provide a web form that stores pilot applications.
- `src/app/(site)/terms/page.tsx:27-36` requires a separate written pilot agreement, which conflicts with the agreed no-negotiated-contract model.
- The repository already depends on Zod and uses Server Components by default; interactive components use focused `"use client"` boundaries.

## Required launch configuration

- Vercel hosting is configured.
- `pinbound.golf` is a verified Resend sending domain.
- Server-only `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` variables exist in Vercel. Never expose or print their values.
- A Vercel WAF rate-limit rule protects `POST /contact` before production.
- WorkOS AuthKit is installed and configured elsewhere, including proxy, callback, account persistence, and the first onboarding destination.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Add Resend | `bun add resend` | exit 0; manifest and lockfile update |
| Typecheck | `bun run typecheck` | exit 0, no errors |
| Lint/format check | `bun run check` | exit 0 |
| Production build | `bun run build` | exit 0; all routes generate |
| Development server | `bun run dev` | Contact available locally |

## Suggested executor toolkit

- Read the installed Next docs before coding:
  - `node_modules/next/dist/docs/01-app/02-guides/forms.md`
  - `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`
- Follow current primary provider docs:
  - `https://resend.com/nextjs`
  - `https://resend.com/docs/api-reference/emails/send-batch-emails`
  - `https://workos.com/docs/sdks/authkit-nextjs`
- Use `shadcn` for the project’s installed form controls and Card primitives.
- Use `web-design-guidelines` and `next-dev-loop` for form accessibility, pending/error states, Cache Components behavior, and browser QA.

## Scope

**In scope**:

- `package.json`
- `bun.lock`
- `src/lib/site.ts`
- `src/app/(site)/contact/page.tsx`
- `src/app/(site)/contact/actions.ts` (create)
- `src/app/(site)/contact/contact-form.tsx` (create)
- `src/app/(site)/get-started/page.tsx`
- `src/app/(site)/privacy/page.tsx`
- `src/app/(site)/terms/page.tsx`
- `src/emails/contact-notification.tsx` (create)
- `src/emails/contact-acknowledgement.tsx` (create)

**Out of scope**:

- Building WorkOS AuthKit, callback/session handling, database records, workspaces, or onboarding screens.
- Phone number, scheduler, course autocomplete, CRM/database storage, mailing list consent, analytics, waitlist, file attachments, or automated tests.
- Editing homepage structure beyond shared constants already owned by plan 001.
- Any pre-existing out-of-scope worktree change, including the blog and Open Graph surfaces listed in `plans/README.md`.

## Git workflow

- Branch: `codex/002-contact-signup`
- Prefer two commits: Contact/Resend, then Get Started/terms routing.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Simplify the shared site/contact constants

Plan 001 has already changed `CTA_LABEL` to `Get started`. Rename `FOUNDERS_EMAIL` to `CONTACT_EMAIL` and update every import in the in-scope routes. Remove `PILOT_EMAIL_HREF` and its email-body builder after no callers remain. Keep company-first voice; do not add founder biography, “solo founder,” or language that implies a larger team.

**Verify**: `rg -n "FOUNDERS_EMAIL|PILOT_EMAIL_HREF|Plan your pilot|with the founders|people building" src/lib 'src/app/(site)' src/components/landing` → no stale founder/pilot-email matches in public conversion surfaces.

### Step 2: Define the minimum Contact form contract

Create a server-side Zod schema and matching client form with these fields:

- Name — required.
- Email — required; label it “Email,” not “Work email.”
- Course or company — required free text.
- Inquiry type — required select: `Product question`, `Tee-sheet integration`, `Partnership`, `Support`, or `Other`.
- Tee-sheet provider — optional free text.
- Phone — optional; do not imply phone support.
- Message — required, with a clear maximum length.
- Website — visually hidden honeypot; never delivered.

Do not add Google Places or another course database. Use native labels, autocomplete attributes, field descriptions only where needed, accessible field-level errors, an `aria-live` form result, and a disabled/pending submit button through `useActionState`.

**Verify**: with `bun run dev`, submit empty/invalid fields and confirm focus, errors, labels, and keyboard order work at 390px and 1440px.

### Step 3: Deliver the inquiry and acknowledgment through Resend

Create a `"use server"` action that:

1. Validates all `FormData` with the server schema.
2. Treats a filled honeypot as success without sending.
3. Generates one submission ID and an idempotency key.
4. Uses `resend.batch.send()` to send exactly two transactional emails:
   - an internal notification to the fixed `CONTACT_TO_EMAIL`, with Reply-To set to the validated visitor email and every submitted field safely rendered;
   - a short acknowledgment to the visitor confirming receipt and setting a realistic expectation without promising a response window.
5. Returns a controlled success or retryable error state without exposing provider/API details.

Never interpolate user content into raw HTML. Use React email components/JSX so text is escaped. Do not log the payload, store it in a database, add it to a Resend Audience, or send user-entered content back in the acknowledgment. The fixed acknowledgment prevents the form from becoming an arbitrary email relay.

**Verify**: in a Resend test environment, one valid submission produces exactly the two intended messages with the same idempotency group; a failed provider call shows the retry state and preserves the visible email fallback.

### Step 4: Redesign Contact as the single general inquiry surface

Use a balanced two-column desktop layout: concise company-first intro and direct email fallback on the left; the form on the right. On mobile, show the intro, then the form, then the fallback. Keep the page useful for every inquiry type; do not turn it into a pilot application or integration-specific waitlist.

Add a privacy link adjacent to the submit action. On success, keep the submitted state clear and provide a route back to the homepage; do not auto-redirect.

**Verify**: manually exercise default, field-error, pending, provider-error, honeypot, and success states. The `mailto:` fallback remains usable in every state.

### Step 5: Configure Vercel abuse protection

In the Vercel dashboard, create a WAF rule scoped to `POST /contact` with a conservative per-client rate limit suitable for a human contact form. Start in log mode on a preview deployment, verify normal submissions are not blocked, then enable rate limiting before production. Keep the honeypot even with WAF.

Do not add CAPTCHA unless production spam demonstrates a need. Document the WAF rule name and threshold in the plan completion note without recording IP data or secrets in the repository.

**Verify**: preview requests below the threshold succeed; rapid repeated requests are limited without blocking ordinary GET navigation to `/contact`.

### Step 6: Align privacy and terms with the actual launch flow

Update Privacy to disclose the Contact fields, delivery through Resend, the purpose of the two transactional emails, retention at the email provider/inbox, and the contact route for deletion questions. Remove the statement that no form exists. Do not claim CRM storage, analytics collection, or marketing use.

Update Terms to remove the bespoke “separate written agreement” requirement. Clarify that “No contract” means no negotiated or long-term sales contract, and that account activation requires acceptance of standard online service terms, data/recording terms, and the necessary telephony/tee-sheet authorizations.

**Verify**: Contact, Privacy, Terms, and the final CTA describe the same data and commercial flow without contradiction.

### Step 7: Replace `/get-started` with the WorkOS signup handoff

Do this step only after the external WorkOS AuthKit/product-auth prerequisite is complete. Remove the email-based pilot page. Implement `/get-started` as a GET route/page that calls WorkOS AuthKit’s current `getSignUpUrl()` server helper and redirects to the hosted signup flow. The WorkOS callback/onSuccess path must send new users into the first onboarding screen; that product behavior is owned by the auth/onboarding implementation, not this plan.

Do not use a hardcoded hosted URL or a client-side redirect. Preserve `/get-started` as the stable public CTA so marketing links never need to know WorkOS internals.

**Verify**:

- Signed-out GET `/get-started` initiates the WorkOS sign-up screen.
- Successful signup returns through the configured callback and reaches the first onboarding screen.
- Cancel/back returns safely to the site.
- Missing WorkOS configuration fails closed; it never falls back to the old mailto page.

### Step 8: Run full verification

**Verify**:

- `bun run typecheck` → exit 0.
- `bun run check` → exit 0.
- `bun run build` → exit 0 with Cache Components validation satisfied.
- Contact form and email fallback work at mobile/desktop widths.
- Get Started routes to WorkOS only after its prerequisite exists.
- No secret value appears in client bundles, rendered HTML, logs, or plan files.

## Test plan

By explicit owner decision, do not add automated tests. Manually verify the full state matrix described in steps 2–8 using a Vercel preview deployment, Resend’s test environment, and the configured WorkOS development environment. Record the tested browser/device widths and provider outcomes in the completion note.

## Done criteria

- [ ] Contact contains the agreed seven fields and accessible form states.
- [ ] Resend sends one internal notification and one fixed acknowledgment.
- [ ] Email fallback remains visible; no phone/scheduler/course lookup is added.
- [ ] Vercel WAF and honeypot protect submission without CAPTCHA.
- [ ] Privacy and Terms match the form and standard click-through model.
- [ ] Company-first wording replaces plural-founder/pilot-email language.
- [ ] `/get-started` initiates WorkOS signup and returns to onboarding.
- [ ] Typecheck, check, build, and manual provider/browser QA pass.
- [ ] No out-of-scope file is modified.

## STOP conditions

- Resend sending domain, server-only variables, or WAF controls are unavailable.
- The acknowledgment would echo visitor-controlled content or promise an unsupported response time.
- Privacy/terms language cannot be approved before the form is enabled.
- WorkOS AuthKit, callback, or onboarding destination is not finished; complete the Contact work but leave `/get-started` unchanged and mark the plan BLOCKED.
- Implementation expands into auth, database, CRM, analytics, or product onboarding work.

## Maintenance notes

Treat the form schema, email templates, Privacy page, and Resend configuration as one data contract. Any new field or recipient requires validation and disclosure review. Keep `/get-started` provider-agnostic at the public URL even if the auth provider changes later.
