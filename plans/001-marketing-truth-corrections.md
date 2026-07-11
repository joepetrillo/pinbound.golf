# Plan 001: Correct site copy to match confirmed pre-product status

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- src/lib/site.ts src/app/layout.tsx src/components/landing content/blog src/app/(site)` If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (content correctness)
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

The repo's own product brief, `docs/pinbound-product-context.md`, confirms Pinbound is pre-launch and pre-product: no customers, no production calls, no certified tee-sheet integrations, and EZLinks API access not yet obtained. Its "Marketing truth and current-site corrections" section (lines 159–167) explicitly requires fixing the site **before driving traffic**: it currently advertises $299 pricing, claims EZLinks/GolfNow are live, leads with 24/7 coverage, markets shadow mode as available, and presents illustrative audio as real calls. These are truth problems, not style problems — every one is a claim a prospect could hold the company to.

## Current state

Read `docs/pinbound-product-context.md` in full before starting — especially "Current reality" (lines 9–13) and "Marketing truth and current-site corrections" (lines 159–167). Key directives quoted from it:

- "The central message is: **Pinbound gives callers fast, consistent help while pro-shop staff stay with the golfer in front of them.**"
- "Do not lead with 24/7 or after-hours coverage."
- "Use approximately $399 per month as a planning hypothesis, **not published pricing**."
- "EZLinks is the intended first tee-sheet integration, but API and sandbox access still need to be obtained and validated."
- "Illustrative Pinehills conversations and audio must be labeled as demos, not customer calls."
- "Personalized course recordings, a public demo line, integrations, prices, and performance claims must not be marketed as available until they are genuinely working."

The offending copy, verified at commit `8a40ad9`:

- `src/lib/site.ts:5` — `export const SITE_URL = "https://pinbound-agent.vercel.app";` (feeds `metadataBase` and OG `url`; the real domain is pinbound.golf)
- `src/lib/site.ts:11-12` — tagline: `"The phone assistant that answers your pro shop's calls and books tee times around the clock."` (rendered in the footer via `site-footer.tsx:43`)
- `src/app/layout.tsx:18-19` — meta description begins `"24/7 AI phone answering for golf courses, wired into your tee sheet — with a dashboard where you control exactly what it's allowed to do..."`
- `src/components/landing/hero.tsx:431` — hero subheader: `"Pinbound is an AI phone agent that answers calls 24/7, books tee times directly into your tee sheet, and handles routine questions according to your course's policies..."`
- `src/components/landing/pricing.tsx:46-51` — a large `$299` `/ month` price display; `pricing.tsx:53` — "Less than $10 a day, a fraction of a part-time hire."
- `src/components/landing/pricing.tsx:12-17` — founding term `{ title: "Starts in shadow mode", description: "After-hours forwarding only — zero risk to your main line while you review every call." }`
- `src/components/landing/pricing.tsx:64-67` — "Tell us about your course and we'll walk through shadow-mode setup. Most founding courses are live on after-hours within days." (the "live within days" claim is unsupported)
- `src/components/landing/faq.tsx:25-26` — FAQ answer: `"EZLinks and the GolfNow family are live today. Every other platform is prioritized by founding-course demand — tell us yours."`
- `src/components/landing/tee-sheet-integration.tsx:25` — `{ badge: "Supported", id: "ezlinks", name: "EZLinks / GolfNow" }` with badge type `"Supported" | "Coming soon"` at line 17
- `src/components/landing/demo.tsx:352-355` — "Tap the orb to try it live, or play a sample call from a real pro shop scenario." The "try it live" orb is a wireframe: tapping it only animates (`demo.tsx:333` shows "Live wireframe — no backend connected yet." _after_ activation), so the section invites an interaction that doesn't exist.
- `src/app/(site)/get-started/page.tsx:19-21` — "claim a founding spot and we'll walk you through shadow-mode setup personally."
- `src/components/landing/policy-fidelity.tsx:27` — "Start with after-hours coverage, add overflow when the shop gets busy..." (acceptable as a _mode description_, see Step 6 — verify wording stays hypothetical, not operational)

Repo conventions: copy lives inline in each section component; cross-page strings live in `src/lib/site.ts`. Formatting is enforced by `bun x ultracite fix`. Components are typed TSX; keep `as const`/interface shapes intact when editing arrays like `faqItems` and `platforms`.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Install | `bun install` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0, no errors |
| Lint/format check | `bun run check` | "All matched files use the correct format." |
| Auto-fix format | `bun x ultracite fix` | exit 0 |
| Build | `bun run build` | exit 0 |

## Scope

**In scope** (the only files you should modify):

- `src/lib/site.ts`
- `src/app/layout.tsx`
- `src/components/landing/hero.tsx` (copy strings only)
- `src/components/landing/pricing.tsx`
- `src/components/landing/faq.tsx`
- `src/components/landing/tee-sheet-integration.tsx`
- `src/components/landing/demo.tsx` (copy strings only)
- `src/app/(site)/get-started/page.tsx`
- `plans/README.md` (status row)

**Out of scope** (do NOT touch, even though they look related):

- `content/blog/*.md` — blog-post tone needs the maintainer's voice; deferred (see Maintenance notes).
- All interactive logic in `hero.tsx` / `demo.tsx` (timers, transcripts, audio) — copy strings only.
- `src/app/opengraph-image.tsx` — the Pinehills transcript there is illustrative imagery; handled by the sample-call consolidation plan (008).
- Layout, styling, and component structure — this is a copy change, not a redesign (except the minimal caption additions in Steps 4–5).

## Git workflow

- Branch: `advisor/001-marketing-truth`
- Commit per step or per logical unit; message style matches repo history: short imperative lowercase (e.g. "fix pricing copy").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

Use the replacement copy below verbatim. It was written to comply with the product doc; do not improvise alternative wording.

### Step 1: Fix the canonical URL and footer tagline (`src/lib/site.ts`)

- Line 5: change `SITE_URL` to `"https://pinbound.golf"`.
- Lines 11–12: change `SITE_TAGLINE` to: `"The phone assistant that gives your callers fast, consistent help — while your staff stays with the golfers in front of them."`

**Verify**: `grep -n "vercel.app\|around the clock" src/lib/site.ts` → no matches.

### Step 2: Fix the meta description (`src/app/layout.tsx`)

Line 18–19: change `description` to: `"Pinbound is an AI phone assistant for golf courses. It answers pro shop calls with fast, consistent help — following your course's policies — so staff can stay with the golfers in front of them."`

**Verify**: `grep -n "24/7" src/app/layout.tsx` → no matches.

### Step 3: Fix the hero subheader (`src/components/landing/hero.tsx:430-434`)

Replace the paragraph beginning "Pinbound is an AI phone agent that answers calls 24/7..." with: `"Pinbound is an AI phone assistant that answers your pro shop's calls, handles routine questions according to your course's policies, and is designed to work with your tee sheet. Every caller gets consistent help, while your staff stays present with the golfers right in front of them."`

Do not touch anything else in this file (the transcript animation code is fragile and out of scope).

**Verify**: `grep -n "24/7" src/components/landing/hero.tsx` → no matches. `bun run typecheck` → exit 0.

### Step 4: Fix pricing (`src/components/landing/pricing.tsx`)

1. Replace the price block (lines 43–54: the "After the free pilot" label, the `$299 / month` display, and "Less than $10 a day..." line) with a non-specific founding-rate presentation. Target shape:
   - Label stays "After the free pilot".
   - Replace the `$299` display paragraph with: a `<p>` styled `className="mt-3 text-3xl font-medium tracking-tight md:text-4xl"` containing `Founding-course rate`.
   - Replace the "Less than $10 a day" paragraph text with: `"Simple monthly pricing, set with our founding cohort and locked in before you convert. No published rate until we've proven it on real call volume."`
2. Replace the `shadow-mode` founding term (lines 12–17) with: `{ description: "You hear the agent on your own course's calls during the pilot and approve go-live yourself — nothing touches your main line until you say so.", id: "you-approve-go-live", title: "You approve go-live" }`
3. Replace the paragraph at lines 64–67 ("Tell us about your course and we'll walk through shadow-mode setup. Most founding courses are live on after-hours within days.") with: `"Tell us about your course and your tee sheet. Founding courses work directly with the founders through setup and the pilot."`

**Verify**: `grep -n "299\|shadow" src/components/landing/pricing.tsx` → no matches. `bun run typecheck` → exit 0.

### Step 5: Fix integration claims (`src/components/landing/faq.tsx`, `src/components/landing/tee-sheet-integration.tsx`)

1. `faq.tsx:25-26`: replace the answer with: `"EZLinks / GolfNow is our first target integration and is in active development — not yet certified. Every other platform is prioritized by founding-course demand, so tell us yours."`
2. `tee-sheet-integration.tsx`:
   - Line 17: change the badge union to `badge: "First integration" | "Coming soon";`
   - Line 25: change the EZLinks entry's badge to `"First integration"`.
   - Line 59: the Badge variant ternary compares against `"Supported"` — update it to compare against `"First integration"` so the EZLinks badge keeps the `default` variant.
   - Lines 43–46: replace the section subheader ("Real read/write integration — availability, bookings, cancellations — not a lookup bolted onto a chatbot.") with: `"Built for real read/write tee-sheet integration — availability, bookings, cancellations — starting with our first adapter, certified with founding courses before launch."`

**Verify**: `grep -rn '"Supported"\|live today' src/components/landing/` → no matches. `bun run typecheck` → exit 0.

### Step 6: Label the demo honestly (`src/components/landing/demo.tsx`, `src/app/(site)/get-started/page.tsx`)

1. `demo.tsx:352-355`: replace the section intro paragraph with: `"Play a simulated call to hear how the agent handles common pro-shop scenarios. These are demo recordings, not customer calls."`
2. In the `TalkWidget` idle state (`demo.tsx:326-335`): change the idle label `"Talk to the demo agent"` to `"Live demo coming soon"`, and the idle helper line `"Uses your mic in the browser. No recording is saved."` to `"A browser demo of the live agent is in the works."` Leave the listening-state strings and all state logic unchanged.
3. `get-started/page.tsx:18-21`: replace the paragraph with: `"Sign-up and onboarding are coming soon. In the meantime, claim a founding spot and we'll work with you personally on setup and a free pilot."`
4. Check `src/components/landing/policy-fidelity.tsx:27` — the coverage copy describes configurable modes; confirm it makes no availability claim ("is live", "today"). If it reads as describing a shipped capability rather than how the product works, leave it and note it in your report; do not rewrite beyond this plan's text.

**Verify**: `grep -rn "real pro shop scenario\|shadow-mode\|shadow mode" src/` → no matches. `bun run check` → clean (run `bun x ultracite fix` first if formatting complains).

### Step 7: Full verification

**Verify**: `bun run typecheck` → exit 0; `bun run check` → clean; `bun run build` → exit 0.

## Test plan

No test infrastructure exists yet (plan 002 adds it). Verification is grep-based done criteria plus typecheck/build. If plan 002 has already landed, also run `bun run test` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "24/7\|around the clock" src/` → no matches
- [ ] `grep -rn "299" src/components/landing/pricing.tsx` → no matches
- [ ] `grep -rn "live today\|\"Supported\"" src/components/landing/` → no matches
- [ ] `grep -rn "shadow" src/ --include='*.tsx' --include='*.ts'` → no copy matches (CSS classes like `shadow-lg`/`shadow-sm`/`shadow-xl` are fine and expected)
- [ ] `grep -n "pinbound.golf" src/lib/site.ts` → 1+ match; `grep -n "vercel.app" src/` → no matches
- [ ] `bun run typecheck` exits 0; `bun run build` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any "Current state" excerpt doesn't match the live code (copy already partially corrected — reconcile with the maintainer rather than double-editing).
- You are tempted to write replacement copy not specified in this plan — the wording here is deliberately compliant with `docs/pinbound-product-context.md`; missing wording is a question for the maintainer, not a gap to fill.
- Changing the `badge` union type in `tee-sheet-integration.tsx` produces type errors anywhere outside that file.
- `bun run build` fails for reasons unrelated to your edits.

## Maintenance notes

- **Deferred**: `content/blog/*.md` posts describe the agent operating in present tense (e.g. `after-hours-answering.md`). They need a maintainer-voice pass (label scenarios as illustrative, or reframe as "how it will work"). Deliberately excluded — copy voice is a product decision.
- **Deferred**: `src/app/opengraph-image.tsx` renders a Pinehills transcript; the sample-call consolidation plan (008) touches that file and can add a "demo" framing there.
- Reviewer should check every replaced string against `docs/pinbound-product-context.md:159-167` — that section is the acceptance spec.
- When real pricing, a certified integration, or a working live demo ship, this copy should be revisited — each correction here is a placeholder for a claim that can become true later.
