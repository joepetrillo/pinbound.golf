# Plan 007: Bring `src/components/ui/**` under lint coverage

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- oxlint.config.ts src/components/ui` The ui/ directory is EXPECTED to have changed if plans 004/005 landed first (they are recommended prerequisites) — that is not a STOP. A change to `oxlint.config.ts` itself is a STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (lint fixes to dense audio/WebGL code can change behavior — fix conservatively)
- **Depends on**: 002 (test gate), 004 (delete dead code first — fewer lines to triage), 005 (bug fixes land before lint-driven edits)
- **Category**: dx
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

`oxlint.config.ts` blanket-ignores `src/components/ui/**/*` — which is exactly where the repo's densest, riskiest code lives: `audio-player.tsx` (401 lines of media-element state), `live-waveform.tsx` (574 lines of mic/AudioContext/rAF), `orb.tsx` (WebGL), `waveform.tsx`, `drawer.tsx`, and the rest. A clean `bun run check` therefore gives false confidence: the code most likely to harbor async/cleanup/null-flow mistakes gets zero lint scrutiny. The ignore made sense when these were freshly scaffolded shadcn-style primitives; several have since become substantial hand-maintained application code.

## Current state

Verified at commit `8a40ad9`:

- `oxlint.config.ts` (entire file):

  ```ts
  import { defineConfig } from "oxlint";
  import core from "ultracite/oxlint/core";
  import jsPlugins from "ultracite/oxlint/js-plugins";
  import next from "ultracite/oxlint/next";
  import react from "ultracite/oxlint/react";

  export default defineConfig({
    extends: [core, jsPlugins, next, react],
    ignorePatterns: [
      ...(core.ignorePatterns || []),
      ".agents/**/*",
      "src/components/ui/**/*",
    ],
    rules: {
      "eslint/func-style": "off",
    },
  });
  ```

- `bun x ultracite check` currently passes: "All matched files use the correct format." (81 files). Removing the ignore will add ~17 files and an unknown number of diagnostics.
- The ui/ directory splits into two kinds of file:
  - **Mostly-scaffolded primitives** (close to upstream shadcn/Base UI): `accordion.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `drawer.tsx`, `separator.tsx`, `skeleton.tsx`, `tabs.tsx`, `toggle.tsx`, `toggle-group.tsx`, `message.tsx`, `message-scroller.tsx`.
  - **Hand-written application components**: `audio-player.tsx`, `live-waveform.tsx`, `waveform.tsx`, `scrub-bar.tsx`, `orb.tsx`.
- `AGENTS.md` documents the Ultracite standards these files will be held to; `bun x ultracite fix` auto-fixes most mechanical issues.

## Commands you will need

| Purpose   | Command               | Expected on success |
| --------- | --------------------- | ------------------- |
| Lint      | `bun run check`       | clean (goal state)  |
| Auto-fix  | `bun x ultracite fix` | exit 0              |
| Typecheck | `bun run typecheck`   | exit 0              |
| Build     | `bun run build`       | exit 0              |
| Tests     | `bun run test`        | all pass (plan 002) |

## Scope

**In scope**:

- `oxlint.config.ts` (remove the blanket ignore; targeted per-rule or per-file overrides allowed)
- Any file under `src/components/ui/` (lint-driven fixes only)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- Behavioral rewrites: if a diagnostic can only be satisfied by restructuring logic (e.g. cognitive-complexity on `waveform.tsx` internals), suppress it narrowly instead (see Step 3 policy).
- Consumer files in `src/components/landing/` and `src/app/` — ui/ public APIs (exported names and prop types) must not change.
- Re-adding lint for `.agents/**/*` — unrelated.

## Git workflow

- Branch: `advisor/007-lint-ui`
- Commit in reviewable units: config change first, then auto-fixes, then manual fixes per file.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the ignore and take inventory

Delete the `"src/components/ui/**/*"` line from `ignorePatterns` in `oxlint.config.ts`. Run `bun run check` and save the full output. Count diagnostics per file and per rule.

**Verify**: `bun run check` runs across ~98 files (was 81) and reports a diagnostic inventory (non-zero exit expected at this step).

### Step 2: Apply safe auto-fixes

Run `bun x ultracite fix`, then `git diff` and READ the diff for the hand-written files (`audio-player.tsx`, `live-waveform.tsx`, `waveform.tsx`, `scrub-bar.tsx`, `orb.tsx`) — auto-fixes to formatting/imports are fine; any auto-fix that touches control flow, hook dependency arrays, or async behavior must be individually justified or reverted.

**Verify**: `bun run typecheck` → exit 0; `bun run test` → all pass; `bun run build` → exit 0.

### Step 3: Triage remaining diagnostics

Fix-vs-suppress policy, per diagnostic:

- **Fix** mechanical issues: unused vars/imports, `let`→`const`, template literals, `for...of`, naming, early returns — anything with no behavioral surface.
- **Fix carefully** correctness rules (exhaustive-deps, no-floating-promises equivalents): these are the reason this plan exists. For each, read the surrounding code; if the fix is obvious and local, make it; if fixing would restructure playback/animation logic, add a line-level disable comment with a one-line reason instead, e.g. `// oxlint-disable-next-line <rule> -- rAF loop intentionally reads stale ref`.
- **Suppress at file/rule level** only for scaffolded-primitive style rules that fight upstream shadcn idioms (e.g. class-string length or complexity in `drawer.tsx`/`toggle-group.tsx`): prefer a rule override scoped to named files in `oxlint.config.ts` over re-ignoring the directory. The blanket directory ignore must NOT return.

After each file: `bun run typecheck && bun run test`.

**Verify**: `bun run check` → exit 0, "All matched files use the correct format." / no errors.

### Step 4: Behavioral regression pass

`bun run dev`, then exercise the interactive surfaces the linted files power:

1. `/#demo`: play/pause each sample call, drag the scrubber, tap the orb (WebGL renders, animates while "listening").
2. Hero transcript animation plays and switches tabs (Booking / Cancellation / Hours & rates).
3. Theme toggle works; drawer (mobile nav, if present at small viewport) opens/closes.

**Verify**: all three behave identically to `main` (compare against a stash or the deployed site if unsure).

## Test plan

Plan 002's suite is the regression net — run `bun run test` after every file's fixes. No new tests required, but if a lint fix reveals a real bug (not just style), write a test capturing it before fixing, and note it in the completion report.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "src/components/ui" oxlint.config.ts` → no blanket ignore (scoped rule overrides naming specific files are acceptable)
- [ ] `bun run check` exits 0
- [ ] `bun run typecheck`, `bun run test`, `bun run build` all exit 0
- [ ] Every remaining `oxlint-disable` comment in `src/components/ui/` carries a `--` reason
- [ ] Exported names/prop types of ui/ modules unchanged (`grep -rn 'from "@/components/ui/' src/` consumers still typecheck)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The diagnostic count after Step 1 exceeds ~150 — the triage budget assumption is wrong; report the inventory and let the maintainer choose scope.
- A correctness diagnostic (hook deps, floating promise) in `audio-player.tsx` or `live-waveform.tsx` looks like a REAL bug whose fix isn't local — report it as a finding instead of fixing blind.
- Step 4 shows any behavioral difference you cannot trace to an intentional fix.
- Plans 004/005 have not landed and their target lines generate diagnostics — coordinate ordering rather than fixing code those plans will delete/change.

## Maintenance notes

- New ui/ components are now linted by default — scaffolded shadcn additions may need a scoped override at add time; that friction is intentional.
- Reviewer: scrutinize every change to a dependency array or async call in the hand-written files; those are the only genuinely risky hunks.
- Deferred: enabling stricter rule sets (a11y plugin already comes via ultracite/react) — revisit once this baseline is green in CI.
