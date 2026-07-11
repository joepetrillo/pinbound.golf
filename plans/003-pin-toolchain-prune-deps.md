# Plan 003: Pin Next.js to an exact preview version and remove dead dependencies

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- package.json bun.lock` If these files changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (002 recommended first so `bun run test` exists as a gate)
- **Category**: migration / security
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

`package.json` declares `"next": "preview"` — a floating dist-tag, not a version. Any install that regenerates the lockfile silently pulls whatever Next.js preview build is current, into a codebase that depends on preview-only APIs (`cacheComponents`, `partialPrefetching`). That is both a reproducibility problem and a supply-chain exposure. Separately, four packages are dead weight: `@react-three/drei` is never imported, `eslint-plugin-github` and `eslint-plugin-sonarjs` belong to an ESLint setup this repo doesn't have (it lints with oxlint via ultracite), and the `shadcn` CLI sits in runtime `dependencies` though nothing imports it.

## Current state

Verified at commit `8a40ad9`:

- `package.json:25` — `"next": "preview"`. The lockfile currently resolves this to **`next@16.3.0-preview.5`** (`bun.lock:1363`).
- `package.json:17` — `"@react-three/drei": "^10.7.7"` in `dependencies`. `grep -rn "drei" src/` → zero matches. The orb (`src/components/ui/orb.tsx:3`) imports only `@react-three/fiber` and `three` — keep those.
- `package.json:43-44` — `"eslint-plugin-github": "^6.1.1"` and `"eslint-plugin-sonarjs": "^4.1.0"` in `devDependencies`. There is no ESLint config anywhere; linting is `oxlint.config.ts` extending `ultracite/oxlint/*`. Zero references to either plugin outside `package.json`/`bun.lock`.
- `package.json:30` — `"shadcn": "^4.13.0"` in `dependencies`. It is a scaffolding CLI; `grep -rn 'from "shadcn"' src/` → zero matches. Distinct from `@shadcn/react` (`package.json:20`), which IS a runtime dependency used at `src/components/ui/message-scroller.tsx:9` — do not remove `@shadcn/react`.
- `components.json` exists (shadcn CLI config) — the CLI is still occasionally useful, so move it to `devDependencies` rather than delete.
- Baseline: `bun run typecheck` → exit 0; `bun x ultracite check` → clean.

## Commands you will need

| Purpose                    | Command             | Expected on success |
| -------------------------- | ------------------- | ------------------- |
| Install                    | `bun install`       | exit 0              |
| Typecheck                  | `bun run typecheck` | exit 0              |
| Lint                       | `bun run check`     | clean               |
| Build                      | `bun run build`     | exit 0              |
| Tests (if plan 002 landed) | `bun run test`      | all pass            |

## Scope

**In scope** (the only files you should modify):

- `package.json`
- `bun.lock` (via `bun install` only — never hand-edit)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- Upgrading `next` to a NEWER preview than the lockfile's current resolution — this plan pins the status quo; upgrading is a separate, deliberate act.
- `typescript` (^6.0.3 beta) — pinning it is defensible but it's a caret range on a real version, not a floating tag; leave it.
- Any file in `src/` — nothing imports the removed packages, so no source changes are needed. If typecheck/build says otherwise, STOP.
- `@shadcn/react`, `@react-three/fiber`, `three` — used at runtime.

## Git workflow

- Branch: `advisor/003-pin-and-prune`
- One commit is fine; message style: short imperative lowercase (e.g. "pin next, prune unused deps").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the currently resolved Next version

Run: `grep -o '"next@[^"]*"' bun.lock | head -1` → expected `"next@16.3.0-preview.5"`. If it resolves to a different version, use THAT version in Step 2 (the lockfile is the source of truth for "what we're actually running").

**Verify**: command above prints exactly one `next@<version>` string.

### Step 2: Pin `next` in `package.json`

Change `"next": "preview"` to the exact resolved version from Step 1, e.g. `"next": "16.3.0-preview.5"` (no `^` or `~` — preview builds don't follow semver compatibility).

**Verify**: `bun install` → exit 0, and `git diff bun.lock` shows no change to the resolved `next` version (only the manifest specifier line).

### Step 3: Remove dead packages, relocate the CLI

- Remove from `dependencies`: `@react-three/drei`.
- Remove from `devDependencies`: `eslint-plugin-github`, `eslint-plugin-sonarjs`.
- Move `shadcn` from `dependencies` to `devDependencies` (same version range).

Then run `bun install`.

**Verify**: `bun install` → exit 0; `grep -c "drei\|eslint-plugin-github\|eslint-plugin-sonarjs" package.json` → 0; `grep -n '"shadcn"' package.json` → appears once, under `devDependencies`.

### Step 4: Full gate

**Verify**: `bun run typecheck && bun run check && bun run build` → all exit 0. If plan 002 landed, also `bun run test` → all pass. Then start `bun run dev` briefly and load `http://localhost:3000/` — page renders without a missing-module error (the orb section may lazy-load on scroll to `#demo`; visit it).

## Test plan

No new tests — this is a manifest-only change. The gate is Step 4 (typecheck + build + dev-server render, plus the plan-002 suite if present).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n '"next":' package.json` shows an exact version (no `preview`, no `^`)
- [ ] `@react-three/drei`, `eslint-plugin-github`, `eslint-plugin-sonarjs` absent from `package.json`
- [ ] `shadcn` present only in `devDependencies`
- [ ] `bun install` exits 0; `bun run typecheck`, `bun run check`, `bun run build` all exit 0
- [ ] Only `package.json` and `bun.lock` modified (`git status`, besides `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `bun install` after Step 2 changes the resolved `next` version in `bun.lock` (means the pin didn't take or the lockfile had drifted).
- Removing any package causes a typecheck or build error — that means something DOES use it; report which import broke, restore the package, and stop.
- `bun.lock`'s current `next` resolution is older than `16.3.0-preview.5` AND the build fails with it pinned — the repo may have been floating past its lockfile; report rather than choosing a version yourself.

## Maintenance notes

- Future Next upgrades are now deliberate: bump the pinned version, run the full gate (CI from plan 002), and read the preview release notes — this repo uses `cacheComponents` + `partialPrefetching`, both preview-only surface.
- If the shadcn CLI is ever needed again, `bunx shadcn` works without it being a dependency at all — deleting it entirely is a fine future simplification.
- Reviewer: confirm the diff touches zero source files.
