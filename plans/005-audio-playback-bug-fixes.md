# Plan 005: Fix two audio playback bugs — unhandled play() rejection and untracked rAF fade loop

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- src/components/ui/audio-player.tsx src/components/ui/live-waveform.tsx` If either file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 002 recommended (its audio-player test gives a regression net)
- **Category**: bug
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

Two small but real defects in the demo audio path. First, the play button's click handler calls `player.play(item)` without catching the returned promise; `HTMLMediaElement.play()` rejects with `AbortError` when playback is interrupted (e.g. a fast play→pause toggle or switching between sample calls), producing unhandled promise rejections — console noise in production and error overlays in dev. The scrubber code path already guards this correctly, so the button path is an inconsistency, not a design choice. Second, `LiveWaveform`'s fade-out animation recurses through `requestAnimationFrame` without storing the handle, so unmounting mid-fade leaves ~30 frames of the loop mutating refs on a dead component.

## Current state

Verified at commit `8a40ad9`:

- `src/components/ui/audio-player.tsx:151-167` — the provider's `play`:

  ```ts
  const play = useCallback(
    async (item?: AudioPlayerItem<TData> | null) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }
      await awaitPendingPlay();
      if (item !== undefined && item?.id !== itemRef.current?.id) {
        loadItem(item);
      }
      const playPromise = audio.play();
      playPromiseRef.current = playPromise;
      return playPromise; // <-- raw audio.play() promise returned to caller
    },
    [awaitPendingPlay, loadItem]
  );
  ```

  `awaitPendingPlay` (`:122-131`) swallows the _previous_ promise's rejection with a comment "An interrupted play() rejects with AbortError; safe to ignore." — the intent is established; the returned promise just isn't covered.

- `src/components/ui/audio-player.tsx:391-397` — the uncovered call site in `AudioPlayerButton`:

  ```tsx
  onPlayingChange={(shouldPlay) => {
    if (shouldPlay) {
      player.play(item);      // <-- returned rejection uncaught
    } else {
      player.pause();
    }
  }}
  ```

- The correctly-guarded exemplar: `src/components/landing/demo.tsx:172-176` (scrubber path) catches the play rejection — match that intent.
- `src/components/ui/live-waveform.tsx:208-240` — inside a `useEffect` (deps `[processing, active, barWidth, barGap, mode]`), the `else if (!active && !processing)` branch defines `fadeToIdle`, which recurses via `requestAnimationFrame(fadeToIdle)` at `:229` with no stored handle, and the branch returns no cleanup. Contrast the `processing` branch just above (`:197-207`), which stores its handle in `processingAnimationRef` and cancels it in a returned cleanup — that is the in-file pattern to copy. The fade mutates only refs (`staticBarsRef`/`historyRef`) and sets `needsRedrawRef`, so severity is low, but the loop outlives the effect.
- Lint note: `oxlint.config.ts:12` ignores `src/components/ui/**` — rely on `tsc` and tests.

## Commands you will need

| Purpose                    | Command             | Expected on success |
| -------------------------- | ------------------- | ------------------- |
| Typecheck                  | `bun run typecheck` | exit 0              |
| Lint                       | `bun run check`     | clean               |
| Build                      | `bun run build`     | exit 0              |
| Tests (if plan 002 landed) | `bun run test`      | all pass            |

## Scope

**In scope** (the only files you should modify):

- `src/components/ui/audio-player.tsx`
- `src/components/ui/live-waveform.tsx`
- `src/components/ui/audio-player.test.tsx` (extend, if plan 002 created it)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- `src/components/landing/demo.tsx` — its scrubber guard is already correct.
- `src/components/ui/waveform.tsx` — plan 004's territory.
- Any broader refactor of the player state machine — surgical fixes only.

## Git workflow

- Branch: `advisor/005-audio-bug-fixes`
- One commit per bug; message style: short imperative lowercase (e.g. "fix scrubbing" exists in history).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Cover the play() rejection at the source

In `audio-player.tsx`'s `play` (lines 151–167), keep returning a promise to callers but make the stored/returned promise rejection-safe, mirroring the file's own `awaitPendingPlay` comment. Minimal shape:

```ts
const playPromise = audio.play();
playPromiseRef.current = playPromise;
return playPromise.catch(() => {
  // An interrupted play() rejects with AbortError; safe to ignore.
});
```

Important: keep `playPromiseRef.current` pointing at the ORIGINAL `playPromise` (not the caught chain) so `awaitPendingPlay`'s existing try/catch semantics are unchanged. Do not alter `pause`.

**Verify**: `bun run typecheck` → exit 0.

### Step 2: Cancel the fade loop on cleanup

In `live-waveform.tsx` (effect at lines ~170–241):

1. Add a ref alongside the existing ones (see `processingAnimationRef` for naming style), e.g. `fadeAnimationRef = useRef<number | null>(null)`.
2. In `fadeToIdle`, store each `requestAnimationFrame(fadeToIdle)` handle in `fadeAnimationRef.current`; also store the initial kick-off call's handle by starting the loop with `fadeAnimationRef.current = requestAnimationFrame(fadeToIdle)` instead of calling `fadeToIdle()` synchronously — OR keep the synchronous first call and only track the scheduled recursions; either is acceptable as long as every scheduled frame is tracked.
3. Return a cleanup from the `else if (!active && !processing)` branch that cancels `fadeAnimationRef.current` when set — matching the pattern at `:203-207`.

**Verify**: `bun run typecheck` → exit 0; `grep -n "cancelAnimationFrame" src/components/ui/live-waveform.tsx` → at least 2 matches (processing branch + new fade branch).

### Step 3: Full gate + manual check

**Verify**: `bun run check && bun run typecheck && bun run build` → all exit 0. Then `bun run dev`, open `/#demo` with the browser console open: rapidly click play/pause on a sample call ~5 times and switch between two sample calls quickly → **zero** unhandled-rejection errors in the console. Playback still starts and pauses correctly.

## Test plan

If plan 002's `src/components/ui/audio-player.test.tsx` exists, add one test: stub `HTMLMediaElement.prototype.play` to return `Promise.reject(new DOMException("interrupted", "AbortError"))`, click/invoke the play path, and assert no unhandled rejection (e.g. via `process.on("unhandledRejection")` capture within the test, or vitest's default failure on unhandled rejections — simply awaiting a tick after the call is sufficient for vitest to surface one). If plan 002 has not landed, the Step 3 manual console check is the test plan.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `play` in `audio-player.tsx` returns a rejection-handled promise (a `.catch` is visible on the returned chain)
- [ ] `live-waveform.tsx` fade branch tracks its rAF handle and returns a cleanup that cancels it
- [ ] `bun run typecheck`, `bun run check`, `bun run build` all exit 0
- [ ] Manual check in Step 3 shows no unhandled rejections
- [ ] Only in-scope files modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the cited lines doesn't match the excerpts above.
- Making `play`'s returned promise caught breaks any existing consumer that relies on `await player.play()` REJECTING (search first: `grep -rn "player.play\|\.play(" src/components src/app` and read each call site — at plan time the callers are `audio-player.tsx:393` and `demo.tsx:172-176`, neither of which relies on rejection).
- The fade animation visually breaks (bars snap instead of fading) after Step 2.

## Maintenance notes

- If the player ever needs to distinguish real playback failures (`NotAllowedError`, network) from benign `AbortError`, the blanket `.catch` in Step 1 is the place to branch — today the app has no error UI for it, so swallowing matches existing intent.
- Reviewer: check that `playPromiseRef.current` still stores the original promise (subtle regression risk in `awaitPendingPlay` ordering).
