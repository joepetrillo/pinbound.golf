# Pinbound website conversion plans

Rewritten after a full plan-grilling session on 2026-07-15, against commit `aeffb3a`. These plans target the website Pinbound will launch with after the product, EZLinks integration, WorkOS authentication, and ElevenLabs demo agent are ready. The current repository state is not the public product-stage message.

Execute the plans in order. Each executor must read its plan fully, honor its STOP conditions, and update the status row when done.

## Agreed website strategy

- Keep the current hero headline and subtext.
- Keep EZLinks/GolfNow labeled `Supported`; public launch is blocked until that claim is true.
- Keep the live orb and recorded sample calls. The orb must become genuinely conversational before launch; it is not being removed or replaced.
- Keep the pricing slider and its current range/formula as a non-binding estimate. Remove only the unsupported “typical” call-volume benchmark.
- Keep the free 30-day pilot, beginning after activation.
- Keep “No contract,” meaning no negotiated or long-term sales contract. A course still accepts standard click-through service terms before activation.
- Use a company-first identity. Do not add a founder section or imply team size.
- Change the primary CTA from “Plan your pilot” to “Get started.” At launch it initiates WorkOS signup and onboarding.
- Contact becomes a polished Resend form with email fallback. No public phone, scheduler, course autocomplete, CRM, waitlist, or analytics.
- Do not add automated tests in this website pass. Verification is typecheck, lint, build, and focused browser QA.

## Execution order and status

| Plan | Title | Priority | Effort | Depends on | Status |
| --- | --- | --: | --: | --- | --- |
| [001](./001-refine-homepage-conversion.md) | Refine the homepage without increasing its sprawl | P1 | M | — | TODO |
| [002](./002-build-contact-and-signup-routing.md) | Build Contact and route Get Started into WorkOS | P1 | M | 001; WorkOS prerequisite for final step | TODO |
| [003](./003-wire-live-agent-demo.md) | Wire the orb to the finished ElevenLabs agent | P1 | M | 001; finished demo agent | TODO — external agent prerequisite |

Status values: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED (<reason>)`, or `REJECTED (<reason>)`.

## Target homepage order

1. Hero — unchanged headline and subtext.
2. Saturday-morning problem.
3. Three consolidated benefit/control cards.
4. Tee-sheet integrations.
5. Live orb and recorded sample calls.
6. Compact alternatives comparison.
7. Pricing slider and pilot terms.
8. Seven-question FAQ with short answers.
9. Final CTA.

The comparison is the only added homepage section. The control area becomes shorter to offset it; the final CTA remains because it follows objection resolution and serves a clear conversion purpose.

## External launch prerequisites

- **EZLinks/GolfNow:** authorized access and the advertised search, booking, lookup, change, cancellation, payment/fallback, and concurrency behaviors are validated before the site is public.
- **WorkOS AuthKit:** account creation, callback, session management, and the first onboarding route exist before plan 002 replaces `/get-started` with a signup handoff.
- **ElevenLabs:** a finished website demo agent exists with approved prompt, tools, disclosure, data-retention behavior, cost controls, and authentication before plan 003 wires the orb to it.
- **Resend:** `pinbound.golf` is verified for sending, and Vercel has the required server-only environment variables before plan 002 is deployed.

## Explicitly excluded from this roadmap

- Founder or solo-founder identity content.
- “Pre-launch,” “in development,” or similar stage messaging.
- Rewriting launch-state capabilities into weak future-tense copy.
- Removing the orb, replacing it with recordings, or adding a call-me demo.
- Automated tests, Playwright, analytics, custom event tracking, or experiment infrastructure.
- Public phone number, scheduling embed, searchable course database, CRM, or integration-specific waitlist.
- Fixed-price promises, ROI claims, break-even arithmetic, customer logos, or testimonials without real supporting evidence.
- Building WorkOS authentication/onboarding, the underlying ElevenLabs agent, or the EZLinks adapter. These plans wire completed product capabilities into the public website.

## Verification baseline

Observed before the rewrite:

- `bun run typecheck` passes.
- `bun run check` passes.
- `bun run build` passes and generates all current routes.
- No automated test command exists, and none will be introduced in these plans.
- The working tree already contains unrelated user work in the blog and Open Graph surfaces (`src/app/(site)/blog/`, `src/components/blog/`, and `src/app/opengraph-image.tsx`). Every plan treats all pre-existing out-of-scope changes as user-owned and preserves them.

## Prior research recommendations rejected or reframed

- The report’s founder-identity recommendation is replaced by company-first product proof and operational safeguards.
- The report’s pre-launch truth correction is replaced by hard launch gates: the site intentionally represents the finished first-launch state.
- The report’s no-mic recommendation is already covered by recorded calls, but the live orb remains and must be made functional.
- The report’s phone and scheduler recommendation is replaced by a high-quality Contact form and email fallback.
- The report’s benefit triad and alternatives comparison are retained, but consolidated so the homepage does not become materially longer.
