# Reception-inspired marketing pass

> **Executor instructions:** This is a marketing-site plan. It changes copy, section structure, and visual craft on `/` and `/home`. It does not touch auth, the dashboard, or the onboarding work in `plans/build-resumable-onboarding.md`. Read `docs/pinbound-product-context.md` before writing a single word of copy — it is the truth authority and it overrides anything in this file. Landing motion is CSS-only today; do not add a motion library without asking.
>
> **Planning baseline:** branch `staging` at `2b165c4`, clean tree, 2026-07-30. Reference: <https://elevenlabs.io/reception> (read in full) plus seven screenshots supplied by the user.

## Status

- **Priority:** P0 for Phase 0 (truth), P1 for Phases 1–2, P2 for Phase 3
- **Effort:** Phase 0 S · Phase 1 L · Phase 2 M · Phase 3 M–L · Phase 4 S
- **Risk:** LOW technically, MEDIUM commercially — the page currently makes claims the product cannot back
- **Depends on:** nothing for Phases 0–2. Phase 3 needs an ElevenLabs agent + a fictional demo course.

## Outcome

`/home` reads like a company that knows exactly what it is building and is honest that it is not built yet. It borrows Reception's craft — a split hero where the right half is the real thing, two-column section headers, drawn UI fragments instead of icons, a driven accordion instead of an autoplaying widget, dotted-rule FAQ, a disciplined two-CTA cadence — and rejects Reception's offer, which is a self-serve product you can buy in five minutes. Pinbound sells a conversation, not a signup, until pilots exist.

---

## Part 1 — What Reception actually does, and what transfers

Reception's page is worth copying for structure and craft. Read each pattern with its Pinbound translation attached.

### 1. The hero's right half is the product, not a screenshot

Reception splits the fold: claim on the left, a working demo on the right with a **Chat / Voice** segmented toggle, a gradient orb, and two round buttons — **Call Agent** (you dial) and **Get a call** (it dials you). The lowest-commitment proof is the first thing on the page.

**Pinbound today does the opposite.** The hero's right half is an autoplaying fake transcript that types itself, cycles tabs, and loops. It asks the visitor to watch a scripted ad. Meanwhile the _real_ proof — five recorded calls with waveforms and a voice orb — is stranded at section 5 of 8 (`demo.tsx`), below the fold on every device.

**Translation:** promote the demo into the hero. Reuse `Orb`, `AudioPlayerProvider`, `Waveform`, and `LiveWaveform` — they already exist and are good. The hero's right half becomes one panel with a Reception-style toggle: **Listen** (recorded calls, default) / **Talk** (live agent, Phase 3). Move the transcript animation out of the hero entirely; it has a better home in Part 2, section 4.

### 2. Outcome headline, friction-removal subhead

> "Never miss a call with the most natural-sounding AI receptionist" "Start for free in under 5 minutes, no credit card required."

The subhead never restates the headline. It removes the two reasons someone wouldn't click: time and money.

**Translation:** Pinbound's subhead should remove the two reasons a GM won't call: _this will disrupt my phone line_ and _this will talk to my golfers badly_. Not "no credit card" — a GM does not care.

### 3. Two-column section headers

Screenshots 2 and 4: headline left at ~40% width, explanatory paragraph right at ~45%, big gap. Pinbound stacks headline-over-paragraph in the left column on **every** section (`problem`, `policy-fidelity`, `tee-sheet-integration`, `pricing`, `demo`). Uniform and monotonous. Adopting the two-column header for three of the six sections breaks the rhythm at no cost.

### 4. One product moment, chaptered

Screenshot 2: a single wide product image, and beneath it three captions each sitting under its own horizontal rail — the active rail is solid black, the others are light grey. Features presented as chapters of one image rather than three disconnected cards.

**Translation:** one annotated call, three chapters — _Answers from your rules_ · _Acts on the tee sheet_ · _Hands off to a person_. This is where the transcript animation goes.

### 5. Drawn UI fragments instead of icons

Screenshot 3 is the highest-craft, lowest-cost pattern on the page. Two cards: "Go live in under 5 minutes" shows a **checklist mid-progress** (one row spinning, two checked, two greyed and fading under a mask); "Choose when your team answers first" shows an **actual hours table** with day checkboxes and time pickers. Neither is a screenshot. Both are HTML, drawn to look like the product's config surface.

**Translation:** this pattern is _ideal_ for a pre-product company, because it is visibly an illustration of intended configuration rather than a claim about shipped software. Two cards: a course-knowledge checklist (hours, rates, booking window, cart rules, cancellation policy, temporary conditions) and a coverage-mode picker (agent-first / overflow / busy-line / ring-no-answer / after-hours, with a human-transfer destination). Both are already true statements from the product context doc.

### 6. Verticals accordion with a live panel

Screenshot 4: five industries listed vertically, the selected one expanded with body copy, and a chat panel on the right showing a matching conversation. The visitor drives it.

**Translation:** Pinbound has no verticals — it has one vertical. The equivalent axis is **call type**: Booking · Change or cancel · Rates & hours · Outings & leagues · Weather & rain checks · "Get me a person." Six entries, right panel shows the matching transcript. This is a strictly better home for the tab widget currently in the hero, because the visitor chooses instead of watching.

### 7. Quiet benefit list + one restrained object

Screenshot 5: three benefits, the first expanded, next two collapsed to a single grey line each, with a thin isometric wireframe cube floating in a grey panel.

**Translation:** take the progressive-disclosure list. **Skip the 3D object** — Pinbound already spends a `three.js` bundle on the orb, and a second decorative 3D thing would read as filler. An empty warm panel or nothing at all beats a wireframe cube.

### 8. Dotted-rule FAQ, two columns

Screenshot 7: "Frequently asked questions" pinned left, ten items right, separated by fine dotted rules. Pinbound's FAQ is already 1fr/2fr with an accordion — closest match on the page. Keep it, restyle the separators, and grow the item count from 7 to ~11.

### 9. CTA cadence

Header: **Watch video** + **Get started**. Hero: **Get started**. Close: **Watch Video** + **Set up now**. Always exactly two, always one low-commitment and one high. Pinbound already does this with **Contact** + **Get started** — but its low-commitment CTA points at a contact form, which is not low commitment. Reception's is "watch/hear the thing." Fix the pairing, keep the cadence.

### 10. Pricing as three concrete cards

Screenshot 6: Basic $22 / Plus $55 / Premium $99, gradient headers, minutes + overage rate, capability list, per-card CTA. Concrete and comparable.

**Pinbound cannot do this and must not fake it.** See Part 3.

---

## Part 2 — Proposed page

Current order in `src/components/landing/landing-page.tsx`: `Hero → Problem → PolicyFidelity → TeeSheetIntegration → Demo → Pricing → Faq → FinalCta`

Proposed: `Hero → Problem → OneCall → CallTypes → Control → TeeSheet → Safety → Pilot → Faq → FinalCta`

### 1. Hero — rebuilt

Left column: headline, subhead, two CTAs, one status line.

The current headline — _"The pro shop assistant that never clocks out"_ — leads with 24/7 coverage, which the product doc explicitly forbids as a lead, and "clocks out" is a wink. Replace.

Recommended:

> **The phone stops competing with the counter**
>
> Pinbound answers your course's line, gives callers the same answers your shop would, and puts a person on the phone the moment anyone asks.
>
> [ Hear a real call ] [ Talk to us ]
>
> _In development. We're taking on a small number of design-partner courses._

Alternates if the above tests weak: _"Every caller gets an answer. Every golfer keeps your staff."_ / _"Answer every call without leaving the counter."_

> **Implementation constraint — do not miss this.** The h1 uses `text-[clamp(1.5rem,calc(100cqi/10.2),3.75rem)]`. The `10.2` is the _measured advance width in em_ of the longer of the two authored lines, plus ~2% slack, and the two-line break is authored rather than wrapped (`hero.tsx:441-467`, contract documented in `src/app/motion.css`). A new headline **requires re-measuring that divisor**, or the headline overflows its column at some widths. Keep the headline to two authored lines.

Right column: the demo panel described in Part 1 §1. Default state is **Listen** — a compact version of the current `sampleCalls` list, three calls not five, first one primed. The `Talk` tab is Phase 3; until then it is not rendered at all rather than rendered dead.

The hero card entrance (`[data-anim="hero-card"]`, `arrive-card`, 900ms) already exists and should carry the new panel unchanged.

### 2. Problem — keep, restyle

`problem.tsx` is the strongest section on the site and has no Reception equivalent. The missed-call stack with the fading mask is genuinely good. Two changes only: apply the two-column header treatment, and cut the last sentence of the paragraph ("next weekend they won't even start with you") — the doubling weakens it.

### 3. OneCall — new (Reception §4 pattern)

One wide panel showing an annotated call, three chaptered captions beneath on rails:

- **Answers from your rules** — hours, rates, booking window, cart policy, today's conditions.
- **Acts on the tee sheet** — searches, books, changes, cancels. _Phrased as intent until an adapter is certified._
- **Hands off to a person** — immediately, on request, no argument.

This is where the transcript animation from the hero lands. Keep the karaoke reveal; drop the auto-advance between conversations (chapters are user-driven now).

### 4. CallTypes — new (Reception §6 pattern)

Left: six call types as a vertical list, selected one expanded with two lines of body. Right: matching transcript panel. Crossfade the panel on change (`animate-in fade-in`, ~200ms) — no library needed.

Accessibility: this is a tab set, not an accordion. Use the existing `Tabs` primitive with vertical orientation so arrow-key navigation and `aria-selected` come free. Every panel must be reachable and readable with JS-driven motion disabled.

### 5. Control — rebuild `policy-fidelity.tsx` (Reception §5 pattern)

Three uniform text cards become two large cards with drawn UI fragments:

- **Set the rules once, change them any time** — checklist fragment: hours ✓, rates ✓, booking window ✓, cart policy (spinner), cancellation policy (grey), temporary conditions (grey, fading under a mask).
- **Choose when Pinbound answers** — coverage-mode fragment: five radio rows (agent-first selected), plus a "when a caller asks for a person → Pro shop, ext. 2" row.

Add a third narrow card or a footer line for the material that gets displaced: private testing, explicit go-live approval, kill switch, automatic fallback. That content is a differentiator against every generic answering service and must not be lost.

**Both fragments must be visually captioned as illustrations of the setup screens, not screenshots.** A small "Illustration" or "Setup, in progress" label. Non-negotiable — see Part 3.

### 6. TeeSheet — keep the section, fix every claim

See Part 3. Structure stays: header, logo grid, "Don't see your tee sheet?" card. The demand-collection card is genuinely smart pre-launch — keep it and make it the section's point rather than its footnote.

### 7. Safety — new, small (Reception §7 pattern)

Three progressive-disclosure lines, first expanded:

- **A person is always one sentence away** — "talk to a person" transfers immediately; VIP numbers can bypass entirely; if nobody picks up, staff get a callback task with the transcript.
- **Your tee sheet stays the source of truth** — nothing is confirmed to a caller until the tee sheet returns success.
- **Every call says what it is** — callers are told they're speaking to an AI assistant and that the call is recorded, on every call, with no toggle.

No 3D object. Left column only, or a wide two-column list.

### 8. Pilot — replaces `pricing.tsx`

Three steps, Reception's pricing-card rhythm without the prices:

1. **A 20-minute call** — how your phone is set up now, what callers actually ask, which tee sheet you run.
2. **Your course's agent, built** — we configure it from your published rates, hours, and booking rules. You call it and hear it before anyone else does.
3. **A pilot on your line, when you approve it** — you set coverage, you approve go-live, you keep a kill switch.

Then one honest pricing line: _"Pricing is set after the first pilots. You'll see the number before you commit to anything, and there's no charge during the pilot."_

### 9. FAQ — keep shape, extend

Keep the 1fr/2fr grid. Restyle separators to fine dotted rules. Keep all 7 existing items, correcting the tee-sheet answer (Part 3), and add:

- **Do I need a new phone number?** No — Pinbound answers your existing line through forwarding or SIP routing; caller ID is preserved.
- **Do you need my tee sheet connected to start?** No. Pinbound can answer questions and route calls before any tee-sheet connection exists.
- **What does it cost?** Pricing is set after the first pilots; the pilot itself is free.
- **When can we actually start?** Honest answer about design-partner timing.
- **What happens to recordings and transcripts?** Retention defaults, who can see them, how to delete.

### 10. FinalCta — retarget

Current: "Ready to stop missing calls? / Free 30-day pilot. No contract." Change the CTA pair to **[ Hear a real call ] [ Talk to us ]** and drop "No contract" (nothing is being contracted). Keep the band.

### Header

Add the low-commitment CTA to match Reception's pairing: **[ Hear a call ] [ Talk to us ]** replacing **[ Contact ] [ Get started ]**. `CTA_LABEL`/`CTA_HREF` in `src/lib/site.ts` currently point at `/auth/sign-up`, which is behind `COMING_SOON_MODE` in production and cannot serve a self-serve signup anyway. **Repoint every marketing CTA at `/contact`** until signup is real, and update `NAV_LINKS` for the new section ids.

---

## Part 3 — The MUSTS

These come from `docs/pinbound-product-context.md`. Several are already violated on the live site; the doc flagged them and they are still there. **Phase 0 exists to fix them and should ship before any traffic is driven to the page.**

| # | Rule | Current violation | Fix |
| --- | --- | --- | --- |
| 1 | Do not lead with 24/7 or after-hours | Hero h1 "never clocks out"; hero body opens "answers calls 24/7" | New headline + subhead (Part 2 §1) |
| 2 | Do not publish pricing | `pricing-estimator.tsx` publishes a live $299–$1,199 slider; doc says $399 is a planning hypothesis, not published pricing | Delete the estimator; replace the section with Pilot (Part 2 §8) |
| 3 | Do not market unearned integrations | EZLinks/GolfNow carries a **"Supported"** badge; API and sandbox access have not been obtained | Badge becomes "First integration, in progress"; others "Planned" |
| 4 | Do not imply working tee-sheet transactions | "Pinbound searches live availability and can book, look up, change, and cancel tee times" (present tense); FAQ says "EZLinks is supported for availability, booking, lookup, changes, and cancellations" | Rewrite both to intent/conditional, and say plainly that no adapter is certified yet |
| 5 | Label all demos as illustrative | `demo.tsx` does this well. `problem.tsx`'s missed-call stack, the hero transcript, and any new UI fragments do not | One clear label per illustrative artifact |
| 6 | Never imply a live agent that isn't live | The **"Try the demo agent"** orb takes microphone permission and renders a waveform of your own voice. Nothing answers. This is the most misleading element on the site | Remove or relabel in Phase 0; make it real in Phase 3 |
| 7 | Do not market layoffs | Not violated — keep it that way | — |
| 8 | No golf puns, robot imagery, fake scarcity, unsupported stats, fake testimonials | "never clocks out" is a mild wink; otherwise clean | Headline change covers it |
| 9 | Pilot terms describe a purchasable product | `pricing.tsx` sells a 30-day pilot with pooled usage, threshold alerts, and no-surprise-shutoff — none of which can be delivered | Fold the honest parts into Pilot; drop the billing mechanics |
| 10 | Audience is a GM, not an SMB owner | "no credit card," "5 minutes," self-serve framing would all be wrong imports from Reception | Never import them |

### Golf-specific judgments Reception can't inform

- **The buyer is not the user.** A GM buys; pro-shop staff operate; golfers call. Reception's page has one persona. Pinbound's needs to reassure the GM (control, liability, reversibility) while proving to them that _their staff_ will be relieved and _their golfers_ won't be annoyed. The `Control` and `Safety` sections carry the GM; the `CallTypes` and demo sections carry the golfer.
- **Golf is seasonal and phone-heavy in bursts.** The Saturday-morning framing in `problem.tsx` is exactly right. Any usage or volume language must survive shoulder season.
- **"Never miss a call" is the wrong hook for golf.** Courses do not primarily lose money to missed calls; they lose staff attention at the counter. The existing `problem.tsx` thesis is stronger than Reception's and should stay the spine of the page.
- **Do not promise tee-sheet writes in any tense that sounds shipped.** This is the single claim most likely to end a GM conversation badly.

---

## Part 4 — Craft and visual system

- **Hairline grid.** Reception runs faint vertical rules at the container edges the full height of the page (screenshots 1, 3, 5). Cheap, high-craft, ties the page together. Add as an optional `Section` variant or a single fixed decorative overlay at `max-w-6xl` boundaries. `aria-hidden`, pointer-events none.
- **CTA color.** Reception reserves color for gradient artifacts and keeps every button pure black. Pinbound's `--primary` is a saturated orange (`oklch(0.553 0.195 38.402)`) used for all primary buttons. Consider moving primary buttons to near-black (`--foreground`) and keeping orange for accents, the logo mark, and the orb. Verify contrast in both themes before committing — load the `better-colors` skill.
- **Radii.** Reception's big panels sit around 24px, buttons are pills. Pinbound's `rounded-4xl` computes to ~26px at `--radius: 0.625rem` — already a match. No change.
- **Motion.** The existing arrival system (`src/app/motion.css` + `use-landing-motion.ts`) is well-built and CSS-only. New sections must use `data-reveal` / `data-reveal-group` with `--i`, not new bespoke animation. Reduced-motion handling already exists and must cover the new panels. **Do not add a motion library without asking.**
- **The `three.js` orb.** Already lazy, client-only, with a `Skeleton` fallback. If it moves into the hero, it must not become part of LCP — keep it in the non-default tab or behind an interaction.
- **Performance.** The hero currently ships a client component with an `IntersectionObserver`, a `useSyncExternalStore` reduced-motion subscription, and a word-by-word timer loop, all above the fold. Moving the transcript machinery down-page and putting a mostly-static panel in the hero is a straight win for LCP and INP.
- **Accessibility.** New tab sets get real `Tabs` semantics. The chaptered rails in OneCall are decorative and must not be the only indicator of state. Every drawn UI fragment is `aria-hidden` with a real text description nearby.

---

## Part 5 — AGENTS.md agent context

Everything below cost real time to rediscover this session and will cost it again every run. Append a compact section to the **bottom** of `AGENTS.md`, below the `<!-- END:ultracite-code-standards -->` marker — the two blocks above it are machine-managed (`next dev` rewrites the Next.js block; verify at `node_modules/next/dist/server/lib/generate-agent-files.js`). Keep it under ~40 lines; a bloated AGENTS.md is worse than none.

Content to add:

```markdown
## Marketing site

- **Truth authority:** `docs/pinbound-product-context.md`. Pinbound is pre-product: no customers, no pilots, no certified tee-sheet integrations, no published pricing. Read the "Marketing truth" section before writing or editing any user-facing copy. It overrides your instincts and any older copy on the page.
- **Never claim:** a working tee-sheet integration, a live demo agent, published prices, 24/7 as the lead benefit, or that staff can be replaced. No golf puns, invented stats, or testimonials.
- **Copy constants:** `src/lib/site.ts` is the single source for site name, description, tagline, CTA labels/hrefs, nav links, and contact address. Change copy there, not inline.
- **Landing sections:** one file each in `src/components/landing/`, composed in order by `landing-page.tsx`. Both `/` and `/home` render it. Every section wraps its content in `<Section>` (`src/components/section.tsx`) — shared max-w-6xl, padding, and header scroll offset. Do not hand-roll a container.
- **Motion is CSS-only** and lives in `src/app/motion.css`; `src/hooks/use-landing-motion.ts` only sets `data-inview` and `data-arrival-seen`. New sections opt in with `data-reveal` or `data-reveal-group` plus `--i` on children. There is no motion library — ask before adding one.
- **The hero h1 divisor is measured.** `clamp(...,100cqi/10.2,...)` in `hero.tsx` encodes the advance width of its longer authored line. Changing the headline text without re-measuring breaks the layout.
- **Design tokens:** `src/app/globals.css`. Warm neutrals, orange `--primary`, `--radius: 0.625rem` with `rounded-4xl` on large panels. Dark mode via `.dark`. Use tokens, never raw hex.
- **Production is gated** by `COMING_SOON_MODE` in `src/proxy.ts` — all product/auth routes rewrite to `/coming-soon`. Marketing CTAs pointing at `/auth/sign-up` are not reachable in production.
- **Blog** posts are markdown in `content/blog/`, served through fumadocs.
- **Commands:** `bun run dev` · `bun run typecheck` · `bun x ultracite fix` (run before committing).
- **Plans** live in `plans/`. Read the relevant one before large changes.
```

Optional refinement if the root file gets crowded: move the motion/Section/hero-clamp paragraphs into `src/components/landing/AGENTS.md`. Codex and Cursor read nested `AGENTS.md`; for Claude Code the reliable nested filename is `CLAUDE.md`. Given that, a single root file is the lower-drift choice — take the split only if the root section outgrows ~40 lines.

Update the section map in the final phase, once the new section files exist.

---

## Phases

**Phase 0 — Truth pass.** Fixes every row in Part 3 with minimal restructuring: headline and hero body, EZLinks badge and tee-sheet copy, the FAQ tee-sheet answer, delete or hard-label the fake live demo orb, remove the published price. Small diff, ships alone, unblocks driving traffic. Do this first even if nothing else happens.

**Phase 1 — AGENTS.md context.** Land it before the big rewrite so the rewrite benefits.

**Phase 2 — Structure and copy.** New page order; rebuild Hero, OneCall, CallTypes, Control, Safety, Pilot; two-column section headers; CTA repointing in `site.ts`; header/footer/nav updates.

**Phase 3 — Craft.** Hairline grid, dotted FAQ rules, drawn UI fragments, CTA color decision, motion pass on new sections.

**Phase 4 — Live demo agent.** The real Reception-parity move: an ElevenLabs agent configured for a clearly fictional course, wired to the existing `Orb` + `LiveWaveform` via browser mic, with the Reception-style Listen/Talk toggle in the hero. Must open with the AI + recording disclosure, must be labeled as a fictional course, must not touch a tee sheet. A telephone version ("we'll call you") is a later step and needs Twilio plus abuse controls — browser voice is ~90% of the impact at a fraction of the work.

## Open decisions for the user

1. **Remove published pricing entirely, or keep the estimator behind a "planning estimate, not a quote" label?** The doc says remove. Recommendation: remove — an estimator that can't be honored costs more credibility than it buys.
2. **Primary CTA target while `COMING_SOON_MODE` is on:** `/contact` for everything, or a dedicated `/pilot` page with a shorter form?
3. **Primary button color:** stay orange, or move to near-black with orange as accent?
4. **Phase 4 scope:** browser-mic demo only, or browser + "we'll call you"?

## Done criteria

- [ ] No claim on the page contradicts `docs/pinbound-product-context.md`.
- [ ] No element implies a live agent, a working integration, or a purchasable price.
- [ ] Every illustrative artifact is labeled as illustrative.
- [ ] The fold contains real proof a visitor can act on, not an autoplaying ad.
- [ ] Section headers vary; the page does not read as six identical blocks.
- [ ] All new motion uses the existing CSS contract and respects reduced motion.
- [ ] New tab/accordion patterns are keyboard-navigable with correct ARIA.
- [ ] `bun run typecheck` and `bun x ultracite check` pass.
- [ ] `AGENTS.md` lets the next agent skip the discovery this plan required.

## STOP conditions

- A requested change would state or imply a shipped tee-sheet integration, a live demo agent, a real customer, or a committed price.
- A headline change is requested without re-measuring the hero clamp divisor.
- Phase 4 is requested without the AI-disclosure and recording notice in the agent's opening turn.
- Reception copy is requested verbatim — the offer, audience, and truth conditions are different, and its sentences do not survive the transfer.
