# Plan 001: Refine the homepage without increasing its sprawl

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm its expected result. If a STOP condition occurs, stop and report; do not improvise. When done, update this plan’s row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat aeffb3a -- 'src/app/(site)/page.tsx' src/components/landing/policy-fidelity.tsx src/components/landing/alternatives.tsx src/components/landing/pricing-estimator.tsx src/components/landing/pricing.tsx src/components/landing/faq.tsx src/components/landing/final-cta.tsx src/lib/site.ts` This compares the planning baseline with the current working tree, including staged and unstaged edits. If an in-scope file changed, compare the current-state excerpts with live code. A material mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `aeffb3a`, 2026-07-15

## Why this matters

The current homepage has strong problem framing, control language, integration proof, demo content, and a clear pilot offer. The research adds two useful ideas — a scannable benefit summary and an alternatives comparison — but simply appending both would make the page longer and repetitive. This plan consolidates existing material, adds only the comparison section, sharpens pricing/FAQ copy, and preserves the current launch-state hero and product claims.

## Current state

- `src/app/(site)/page.tsx:13-23` renders eight sections in this order: `Hero`, `Problem`, `PolicyFidelity`, `TeeSheetIntegration`, `Demo`, `Pricing`, `Faq`, `FinalCta`.
- `src/components/landing/hero.tsx:409-416` contains the approved headline and subtext. They must remain unchanged.
- `src/components/landing/problem.tsx:37-44` contains the approved “The counter always wins” and Saturday-morning story. It must remain.
- `src/components/landing/policy-fidelity.tsx:10-40` currently spreads course setup, call visibility, coverage, and human handoff across four cards.
- `src/components/landing/pricing-estimator.tsx:9-25` defines the approved slider range/formula; lines 81–89 add the unsupported “1,200–1,500 is typical” label.
- `src/components/landing/faq.tsx:11-48` has six relevant questions, but several answers are longer than the fast objection-handling role requires.
- `src/lib/site.ts:14` uses the outdated sitewide CTA label “Plan your pilot.”

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Install | `bun install --frozen-lockfile` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0, no errors |
| Lint/format check | `bun run check` | exit 0 |
| Production build | `bun run build` | exit 0; all routes generate |
| Development server | `bun run dev` | site available locally |

## Suggested executor toolkit

- Use `shadcn` to reuse the installed Card/Table patterns and current visual language; do not introduce a new component system.
- Use `web-design-guidelines` for semantic comparison markup, keyboard access, mobile overflow, and heading order.
- Use `next-dev-loop` plus `agent-browser` for desktop/mobile browser QA.

## Scope

**In scope**:

- `src/app/(site)/page.tsx`
- `src/components/landing/policy-fidelity.tsx`
- `src/components/landing/alternatives.tsx` (create)
- `src/components/landing/pricing-estimator.tsx`
- `src/components/landing/pricing.tsx`
- `src/components/landing/faq.tsx`
- `src/components/landing/final-cta.tsx`
- `src/lib/site.ts`

**Out of scope**:

- `src/components/landing/hero.tsx` — headline, subtext, transcript card, and CTA layout stay as designed; its shared CTA label changes through `site.ts` only.
- `src/components/landing/problem.tsx` — preserve the Saturday section intact.
- `src/components/landing/demo.tsx` — plan 003 owns live-agent wiring.
- `src/components/landing/tee-sheet-integration.tsx` — keep vendor statuses and the one shared Contact/Get Started area as-is.
- Founder content, stage messaging, analytics, automated tests, ROI claims, competitor prices, testimonials, or any pre-existing out-of-scope worktree change.

## Git workflow

- Branch: `codex/001-homepage-conversion`
- Use one descriptive commit, e.g. `refine homepage conversion flow`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Change the sitewide primary CTA to “Get started”

In `src/lib/site.ts`, change `CTA_LABEL` to `Get started`. Keep `CTA_HREF` as `/get-started`; plan 002 will replace that route’s email-oriented content with the WorkOS signup handoff after AuthKit exists. Because the header, hero, pricing, footer, and final CTA share this constant, do not hardcode alternate primary labels in individual components.

**Verify**: `rg -n "Plan your pilot" src/components/landing src/lib/site.ts` → no homepage/site-constant matches.

### Step 2: Consolidate four control cards into three benefit/control cards

Keep the section heading “Your rules. Your control.” Replace the four current cards with exactly three concise cards that preserve all important information:

1. **Course knowledge** — approved hours, rates, booking rules, amenities, and expiring temporary updates such as frost delays and cart restrictions.
2. **Coverage and handoff** — coverage modes, immediate human transfer, VIP routing, private testing, go-live approval, kill switch, and automatic fallback.
3. **Visibility and control** — recordings, transcripts, outcomes, tee-sheet actions, uncertain calls, callback tasks, role-based access, summaries, and alerts.

Each card gets one short outcome-led description and one short supporting line. Do not create a separate benefit-triad section; these cards are the triad.

**Verify**: `policy-fidelity.tsx` contains three data items, and every capability listed above still appears in the rendered copy or a clearly equivalent phrase.

### Step 3: Add the compact alternatives comparison

Create `Alternatives` with three columns:

- Pinbound
- Answering service
- Pro-shop staff

Use exactly five rows:

1. Answers while the counter is busy.
2. Uses course-approved information.
3. Completes tee-sheet actions.
4. Transfers judgment calls.
5. Provides searchable call records.

Use fair, durable language. Answering-service capabilities that are not universal must say “Varies by provider.” Describe pro-shop staff respectfully: they can do the work, but phone calls compete with in-person service. Do not use named competitors, prices, ROI, recovered-revenue claims, or icons without text.

Implement an accessible semantic table with visible column/row headers. On mobile, use a labeled horizontal scroll container or accessible stacked cards; do not shrink text until it becomes unreadable.

**Verify**: at 390px and 1440px widths, all headings and cell values are available, readable, and keyboard reachable without clipped content.

### Step 4: Insert comparison without disturbing the approved story

Insert `<Alternatives />` after `<Demo />` and before `<Pricing />`. Preserve the rest of the order:

`Hero → Problem → PolicyFidelity → TeeSheetIntegration → Demo → Alternatives → Pricing → Faq → FinalCta`.

The final CTA remains a standalone section. Keep section spacing consistent; do not compensate for the new section by compressing tap targets or text.

**Verify**: inspect `page.tsx` and confirm the exact component order above.

### Step 5: Keep the slider but clarify its estimate status

Do not change `MIN_MONTHLY_CALLS`, `MAX_MONTHLY_CALLS`, steps, default, base price, formula, or animation. Remove “1,200–1,500 is typical.” Replace the supporting language with a concise statement that the slider is a non-binding planning estimate and pilot usage confirms the final allowance and price.

Keep pricing focused on pricing. Retain a compact included summary rather than adding break-even math or another sales narrative. The summary should cover:

- complete answering and tee-sheet capability;
- human handoff and call records;
- setup/private testing/go-live approval;
- 30 days free beginning after activation.

Keep “No contract” in the final CTA; plan 002 aligns the terms page with the agreed click-through terms model.

**Verify**: `rg -n "1,200–1,500 is typical|pays for itself|break-even|recovered revenue" src/components/landing` → no matches.

### Step 6: Tighten the FAQ to seven high-frequency objections

Keep exactly these seven questions, using the site’s existing Accordion:

1. What if it books something wrong?
2. Can callers still reach a person?
3. Which tee sheets do you support?
4. How are payments handled?
5. Does it identify itself as AI and disclose recording?
6. What does the course control?
7. What happens if Pinbound or the connection goes down?

Cap each answer at two or three short sentences. The reliability answer must cover automatic fallback routing, staff alerts, and no unconfirmed tee-time actions. Do not add founder/company-size, pricing, generic security, or long-form continuity questions.

**Verify**: the FAQ data contains seven items, each answer is focused on the named objection, and the Accordion behavior remains unchanged.

### Step 7: Run project and browser verification

Run the exact gates and manually verify the homepage at 390px and 1440px.

**Verify**:

- `bun run typecheck` → exit 0.
- `bun run check` → exit 0.
- `bun run build` → exit 0.
- Browser order matches the target order.
- Hero headline/subtext, Saturday story, vendor statuses, orb, pricing formula, FAQ Accordion, and final CTA remain present.
- The page gains only one section and the three-card control area is visibly shorter than the previous four-card version.

## Test plan

By explicit owner decision, do not add automated tests or a test dependency in this website pass. The acceptance test is the command and browser matrix above: desktop/mobile layout, keyboard traversal, comparison semantics, Accordion interaction, CTA destinations, and regression checks for preserved content.

## Done criteria

- [ ] Primary CTA reads “Get started” everywhere it uses the shared constant.
- [ ] Control content is consolidated into three cards with no lost capability.
- [ ] A five-row, three-column accessible comparison sits before pricing.
- [ ] Pricing slider formula/range is unchanged and clearly non-binding.
- [ ] FAQ contains the approved seven concise questions.
- [ ] Hero, problem, integrations, demo, final CTA, and page tone are preserved.
- [ ] Typecheck, check, build, and desktop/mobile browser QA pass.
- [ ] No file outside scope is modified.

## STOP conditions

- A requested edit changes the approved hero headline or subtext.
- The comparison requires a named competitor, price, or unsupported universal claim.
- Consolidation cannot retain the control/handoff/visibility information.
- The change requires editing the live demo or integration statuses.
- A verification command fails twice after a reasonable correction.

## Maintenance notes

Keep the homepage section budget explicit. Future marketing ideas should replace or consolidate existing content rather than append another standalone section. Revisit the comparison only when product scope changes; never let category claims silently become stale.
