# Plan 004: Delete ~1,400 lines of unused waveform and message component code

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- src/components/ui/waveform.tsx src/components/ui/message.tsx src/components/landing/demo.tsx src/components/landing/hero.tsx src/components/landing/human-handoff.tsx` If any in-scope or consumer file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: 002 recommended (test gate); independent otherwise
- **Category**: tech-debt
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

`src/components/ui/waveform.tsx` is 1,701 lines and exports 7 components, but the app imports only 2 (`Waveform`, `AudioScrubber` — `src/components/landing/demo.tsx:22`). The 5 unused exports carry heavyweight `AudioContext`/`decodeAudioData`/microphone logic, and one of them (`LiveMicrophoneWaveform`) contains a confirmed resource leak: its effect at `waveform.tsx:851-935` creates an `AudioContext` (`:885-889`) but neither the `!active` branch (`:852-869`) nor the effect cleanup (`:919-935`) ever calls `close()` — its siblings `MicrophoneWaveform` and `RecordingWaveform` do close theirs, confirming the omission. Similarly, `src/components/ui/message.tsx` exports 6 components but only `Message` and `MessageContent` are imported anywhere. Deleting this dead surface removes a latent bug, shrinks the lint burden plan 007 will take on, and stops the file from misleading future readers.

## Current state

Verified at commit `8a40ad9`:

- `src/components/ui/waveform.tsx` exports (with line numbers):
  - `WaveformProps` (:34), `Waveform` (:48) — **USED** (`demo.tsx:22`)
  - `ScrollingWaveformProps` (:189), `ScrollingWaveform` (:198) — unused
  - `AudioScrubberProps` (:403), `AudioScrubber` (:412) — **USED** (`demo.tsx:22`)
  - `MicrophoneWaveformProps` (:537), `MicrophoneWaveform` (:546) — unused
  - `StaticWaveformProps` (:733), `StaticWaveform` (:738) — unused
  - `LiveMicrophoneWaveformProps` (:755), `LiveMicrophoneWaveform` (:773) — unused (contains the AudioContext leak described above)
  - `RecordingWaveformProps` (:1373), `RecordingWaveform` (:1387) — unused
  - Repo-wide import check at plan time: `grep -rn 'from "@/components/ui/waveform"' src/` → only `src/components/landing/demo.tsx:22` (`AudioScrubber, Waveform`).
- `src/components/ui/message.tsx` (93 lines) exports `MessageGroup`, `Message`, `MessageAvatar`, `MessageContent`, `MessageFooter`, `MessageHeader` (:85-92). Import check: `grep -rn 'from "@/components/ui/message"' src/` → `hero.tsx:9` and `human-handoff.tsx:3`, both importing only `{ Message, MessageContent }`.
- Note: `src/components/ui/live-waveform.tsx` (`LiveWaveform`) is a **separate file** and IS used (`demo.tsx:15`) — do not confuse it with waveform.tsx's `LiveMicrophoneWaveform`, and do not touch it.
- The unused waveform components may share internal helpers (module-level constants, small utility functions, types) with the used ones — deletion must keep everything `Waveform` and `AudioScrubber` reference.
- `oxlint.config.ts:12` currently ignores `src/components/ui/**/*`, so lint won't flag mistakes here — rely on `tsc` and the build.

## Commands you will need

| Purpose                    | Command             | Expected on success |
| -------------------------- | ------------------- | ------------------- |
| Typecheck                  | `bun run typecheck` | exit 0              |
| Lint                       | `bun run check`     | clean               |
| Build                      | `bun run build`     | exit 0              |
| Tests (if plan 002 landed) | `bun run test`      | all pass            |

## Scope

**In scope** (the only files you should modify):

- `src/components/ui/waveform.tsx` (delete unused exports + orphaned helpers)
- `src/components/ui/message.tsx` (delete unused exports)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- `src/components/ui/live-waveform.tsx` — used, different component, similar name.
- `src/components/landing/demo.tsx`, `hero.tsx`, `human-handoff.tsx` — consumers; their imports must keep working unchanged.
- Fixing/refactoring the KEPT components (`Waveform`, `AudioScrubber`, `Message`, `MessageContent`) — deletion only.
- `src/components/ui/message-scroller.tsx` — different module (wraps `@shadcn/react`), used by hero.

## Git workflow

- Branch: `advisor/004-delete-dead-components`
- Two commits (one per file) or one; message style: short imperative lowercase.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Re-verify the components are unused

Run:

- `grep -rn "ScrollingWaveform\|MicrophoneWaveform\|StaticWaveform\|LiveMicrophoneWaveform\|RecordingWaveform" src/ --include='*.ts' --include='*.tsx'` → matches ONLY inside `src/components/ui/waveform.tsx`.
- `grep -rn "MessageGroup\|MessageAvatar\|MessageHeader\|MessageFooter" src/ --include='*.tsx'` → matches ONLY inside `src/components/ui/message.tsx`.

**Verify**: both greps confirm no external usage. If either finds a consumer, STOP.

### Step 2: Delete unused exports from `waveform.tsx`

Delete these components and their prop types: `ScrollingWaveform(+Props)`, `MicrophoneWaveform(+Props)`, `StaticWaveform(+Props)`, `LiveMicrophoneWaveform(+Props)`, `RecordingWaveform(+Props)`. Then delete any module-level helpers, constants, refs, or types that are now referenced by nothing (typecheck + `bun run check`'s unused-code rules won't see this file per the oxlint ignore — use `tsc` errors and manual search: after deleting, grep each remaining top-level identifier in the file for usage).

Keep intact: `WaveformProps`, `Waveform`, `AudioScrubberProps`, `AudioScrubber`, and everything they transitively reference.

**Verify**: `bun run typecheck` → exit 0; `grep -c "export" src/components/ui/waveform.tsx` → 4 (two components + two prop types).

### Step 3: Delete unused exports from `message.tsx`

Delete `MessageGroup`, `MessageAvatar`, `MessageHeader`, `MessageFooter` and remove them from the export statement at the file bottom, leaving `export { Message, MessageContent };`.

Optional (only if trivially safe): the class fragments in the KEPT components that reference deleted slots — e.g. `MessageAvatar`'s `group-has-data-[slot=message-footer]` selector lives in the deleted component itself, so nothing in kept code should need edits. Do not edit kept components' classNames.

**Verify**: `bun run typecheck` → exit 0; `grep -n "export" src/components/ui/message.tsx` → exactly one export statement with `Message` and `MessageContent`.

### Step 4: Full gate

**Verify**: `bun run typecheck && bun run check && bun run build` → all exit 0 (run `bun x ultracite fix` first if formatting complains). If plan 002 landed, `bun run test` → all pass. Then `bun run dev`, open `http://localhost:3000/`, scroll to the demo section (`/#demo`), play a sample call, and drag its scrubber — waveform renders and scrubbing works.

## Test plan

No new tests (dead-code deletion). The behavioral gate is the manual demo-section check in Step 4 plus the plan-002 suite if present. If plan 002's audio-player tests exist, they must still pass unchanged.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "ScrollingWaveform\|MicrophoneWaveform\|StaticWaveform\|LiveMicrophoneWaveform\|RecordingWaveform\|MessageGroup\|MessageAvatar\|MessageHeader\|MessageFooter" src/` → no matches
- [ ] `wc -l src/components/ui/waveform.tsx` → under ~700 lines (was 1,701)
- [ ] `bun run typecheck`, `bun run check`, `bun run build` all exit 0
- [ ] Only the two in-scope component files modified (`git status`, besides `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1's greps find any consumer of a to-be-deleted component.
- After deletion, `Waveform` or `AudioScrubber` fails to typecheck because it referenced code you removed and the disentangling is non-obvious (shared helper serving both used and unused paths) — report which helper, don't restructure.
- The demo section renders differently or scrubbing breaks in Step 4's manual check.

## Maintenance notes

- If a live-microphone visualization is wanted later (e.g. for a real browser demo agent), do not resurrect the deleted `LiveMicrophoneWaveform` from git history without fixing its `AudioContext` leak: the effect must call `audioContextRef.current.close()` (guarded by `state !== "closed"`) in both the `!active` branch and the cleanup, as `RecordingWaveform` did at `waveform.tsx:1451-1456` (pre-deletion line numbers).
- Plan 007 (lint the ui/ directory) becomes materially cheaper after this lands — run this first.
- Reviewer: the diff should be pure deletion plus at most an edited export statement; any modified kept-code lines deserve scrutiny.
