# Plan 008: Single-source the sample-call content and make the audio pipeline reproducible

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- scripts/generate-sample-audio.py src/components/landing/demo.tsx src/lib README.md` If `demo.tsx` changed only in its copy strings (plan 001 does that), that is expected — proceed but re-read the current `sampleCalls` array. Structural changes to `sampleCalls` or the Python script are a STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 002 (test gate); run after 001 (it edits `demo.tsx` copy)
- **Category**: tech-debt / docs
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

The five demo sample calls are authored independently in multiple places that must be hand-synced: the Python generator's `CALLS` dict writes the audio, then its stdout JSON (`durationSeconds`, `label`, `peaks`) is manually pasted into `demo.tsx`'s `sampleCalls` array, whose `transcript` strings are themselves paraphrases of — not copies of — the generated audio's lines. They have already drifted (the demo booking transcript is a reworded version of the script's line). The generator also hardcodes one developer's absolute home path, so no other machine can regenerate the audio, and none of this is documented. Editing one sample call today means touching 2–3 files, re-running an undocumented macOS-only script, and hand-copying JSON.

Deliberately narrower than it could be: `hero.tsx`'s animated `CONVERSATIONS` and `opengraph-image.tsx`'s snippet are _different creative artifacts_ (Pinehills-branded, word-timed) — they stay hand-authored. This plan single-sources only the sample-call row data that must stay in lockstep with the `.m4a` files.

## Current state

Verified at commit `8a40ad9`:

- `scripts/generate-sample-audio.py`:
  - `:11` — `PROJECT = Path("/Users/jpetrillo/Documents/Projects/pinbound.golf")` (hardcoded absolute path; `OUT_DIR = PROJECT / "public" / "audio"`).
  - `:20-46` — `CALLS` dict: five entries keyed `sample-call-booking`, `-policy`, `-handoff`, `-hours`, `-weather`, each a list of `(voice, text)` line tuples.
  - `:78-107` — `main()` synthesizes each call with macOS `say` + `afconvert`, writes `public/audio/<name>.m4a`, and `print(json.dumps(meta))` — meta holds `durationSeconds`, `label`, `peaks` (48 buckets) per call. **The stdout JSON is currently hand-pasted into demo.tsx.**
- `src/components/landing/demo.tsx:43-135` — `interface SampleCall { caption; durationLabel; durationSeconds; id; peaks; src; transcript }` and `sampleCalls: SampleCall[]` with all five calls' data inlined, including 48-element peaks arrays and one-line `transcript` strings (comment at `:53`: "Peaks are precomputed from the recordings in public/audio").
- Drift example: script booking line — "Let me check the tee sheet. Tomorrow morning I have 7:40 and 8:10, both walking. Want me to hold one?" vs demo.tsx transcript — "Agent: I have 7:40 and 8:10 — want me to hold one?".
- `public/audio/` holds the five committed `.m4a` files (~450 KB total).
- Repo conventions: JSON-like data as typed TS modules (see `src/lib/site.ts` — typed constants, single source of truth comment at `:1`); path alias `@/*` → `src/*`.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run check` | clean |
| Build | `bun run build` | exit 0 |
| Tests | `bun run test` | all pass (plan 002) |
| Regenerate audio (macOS only) | `python3 scripts/generate-sample-audio.py` | writes `public/audio/*.m4a` + `src/lib/sample-calls.generated.json` |

## Scope

**In scope**:

- `scripts/generate-sample-audio.py`
- `src/lib/sample-calls.generated.json` (create — generated, but committed)
- `src/lib/sample-calls.ts` (create — typed wrapper + hand-authored captions)
- `src/components/landing/demo.tsx` (consume the new module; delete inlined data)
- `README.md` (document the pipeline)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- `src/components/landing/hero.tsx` / `src/app/opengraph-image.tsx` — separate creative artifacts (see Why this matters).
- Re-recording or changing any call's actual audio/content — this is plumbing, not content editing. Do NOT run the generator against edited `CALLS`.
- `public/audio/*.m4a` — the committed audio stays byte-identical.

## Git workflow

- Branch: `advisor/008-sample-call-source`
- Commit per step; message style: short imperative lowercase.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the generator portable and emit a file

In `scripts/generate-sample-audio.py`:

1. Replace the hardcoded path: `PROJECT = Path(__file__).resolve().parent.parent`.
2. Add per-call transcript derivation: the script already has each call's lines; emit them in meta as `transcript`: a single string joining lines as `"Caller: ... Agent: ..."` (role from the voice: `AGENT` voice → "Agent", `CALLER` voice → "Caller"), preserving line order and exact text.
3. Instead of printing to stdout, write the JSON to `src/lib/sample-calls.generated.json`, shaped:

```json
{
  "sample-call-booking": {
    "durationSeconds": 19.77,
    "label": "0:19",
    "peaks": [0.521, ...],
    "src": "/audio/sample-call-booking.m4a",
    "transcript": "Caller: Hi — do you have any tee times tomorrow morning for two? Agent: ..."
  }
}
```

(Also keep a stdout `print` of the output path for operator feedback.)

**Verify**: `python3 -c "import ast; ast.parse(open('scripts/generate-sample-audio.py').read())"` → exit 0 (syntax). Do NOT run the full generator (it would regenerate the committed audio; the existing `.m4a` files must stay byte-identical).

### Step 2: Hand-write the generated JSON once, from existing data

Because the generator must not run (Step 1 note), create `src/lib/sample-calls.generated.json` by hand this one time, transplanting the exact `durationSeconds`, `durationLabel`→`label`, `peaks`, and `src` values currently in `demo.tsx:54-135`, plus `transcript` strings built from the Python `CALLS` lines (`scripts/generate-sample-audio.py:20-46`) using the Step 1 joining rule — i.e., fix the drift in favor of what the audio actually says.

**Verify**: `python3 -c "import json; d=json.load(open('src/lib/sample-calls.generated.json')); assert sorted(d)==['sample-call-booking','sample-call-handoff','sample-call-hours','sample-call-policy','sample-call-weather']; assert all(len(v['peaks'])==48 for v in d.values())"` → exit 0.

### Step 3: Typed wrapper (`src/lib/sample-calls.ts`)

Create a module that imports the JSON (`import generated from "./sample-calls.generated.json"` — TS `resolveJsonModule` must be on in `tsconfig.json`; check, and if absent add it) and exports the array `demo.tsx` needs. Captions are presentation copy, not audio-derived — keep them here:

```ts
const captions: Record<string, string> = {
  "sample-call-booking": "Booking a tee time",
  "sample-call-policy": "Policy question",
  "sample-call-handoff": "Human handoff",
  "sample-call-hours": "Hours & rates",
  "sample-call-weather": "Weather & rain checks",
};

export interface SampleCall {
  caption: string;
  durationLabel: string;
  durationSeconds: number;
  id: string;
  peaks: number[];
  src: string;
  transcript: string;
}

export const sampleCalls: SampleCall[] = [
  /* map generated entries, id = key minus "sample-call-" prefix, in the caption order above */
];
```

Preserve today's display order: booking, policy, handoff, hours, weather.

**Verify**: `bun run typecheck` → exit 0.

### Step 4: Point `demo.tsx` at the new module

Delete the inlined `SampleCall` interface and `sampleCalls` array (`demo.tsx:43-135` at plan time) and import both from `@/lib/sample-calls`. No other changes to demo.tsx.

**Verify**: `bun run typecheck && bun run build` → exit 0. `bun run dev`, open `/#demo`: five sample calls render with identical captions, durations, and waveforms as before; playback works.

### Step 5: Document the pipeline in `README.md`

Add a short section:

```markdown
## Regenerating sample audio

macOS only (uses `say` and `afconvert`):

    python3 scripts/generate-sample-audio.py

Rewrites `public/audio/*.m4a` and `src/lib/sample-calls.generated.json` (durations, waveform peaks, transcripts). The landing page reads that JSON via `src/lib/sample-calls.ts` — edit call content in the script's `CALLS` dict, regenerate, and commit both outputs. Captions live in `src/lib/sample-calls.ts`.
```

**Verify**: section present; `bun run check` → clean.

## Test plan

If plan 002 landed, add `src/lib/sample-calls.test.ts`: assert 5 entries, each with 48 peaks in [0,1], `src` matching an existing file in `public/audio/` (use `node:fs` `existsSync`), and non-empty transcript containing both "Caller:" and "Agent:". Model file layout on `src/lib/blog.test.ts`. Verification: `bun run test` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "peaks:" src/components/landing/demo.tsx` → 0 (data no longer inlined)
- [ ] `grep -n "Users/jpetrillo" scripts/generate-sample-audio.py` → no matches
- [ ] `src/lib/sample-calls.generated.json` exists, passes the Step 2 assertion command
- [ ] `git diff --stat -- public/audio` → empty (audio untouched)
- [ ] `bun run typecheck`, `bun run check`, `bun run build`, `bun run test` all exit 0
- [ ] README documents the regeneration workflow
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `demo.tsx`'s `sampleCalls` structure has drifted from the excerpt (plan 001 only changes copy strings elsewhere in the file — data-shape changes mean another actor got here first).
- `resolveJsonModule` cannot be enabled without breaking other imports.
- You feel the urge to run the generator "to test it" — don't; it would rewrite committed audio with different synthesis output. Syntax-check only.
- The transcript joining rule produces text that contradicts the on-page audio in a way you can hear — report the mismatch, don't edit `CALLS`.

## Maintenance notes

- From now on, sample-call edits happen in ONE place (`CALLS` in the Python script) followed by one regeneration; the maintainer should do the first real regeneration on their Mac to confirm the end-to-end loop, since this plan deliberately never ran it.
- `hero.tsx` `CONVERSATIONS` and `opengraph-image.tsx` remain hand-authored by design; if they ever need to match audio verbatim, extend the generated JSON with per-line arrays (the script already has the lines).
- Reviewer: diff the new JSON's values against the deleted `demo.tsx` literals — they must be identical except the transcripts (intentionally corrected to match the audio).
