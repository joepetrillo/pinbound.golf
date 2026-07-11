# Plan 010: Add getting-started documentation to the README

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- README.md package.json` Plans 002/003/008 may have edited `package.json` scripts or added a README section — expected; document the scripts as they exist NOW, and do not duplicate a "Regenerating sample audio" section if plan 008 already added one.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (best run last so it documents the post-plan state)
- **Category**: docs
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

`README.md` is a three-line product pitch with zero setup instructions: no mention that the package manager is bun, no install/dev/build steps, no note that the project needs no environment variables. `AGENTS.md` covers agent tooling (Ultracite) but not human onboarding. Any new contributor — or the maintainer on a new machine — currently reconstructs the toolchain from `package.json` archaeology.

## Current state

Verified at commit `8a40ad9`:

- `README.md` — full contents: a title and one paragraph describing the planned SaaS. Keep that paragraph; it is accurate as a product description.
- Toolchain facts to document (re-verify each against the CURRENT `package.json` before writing, since earlier plans may have changed them):
  - Package manager: **bun** (`bun.lock`).
  - Scripts at plan time: `dev` (`next dev`), `build` (`next build`), `start` (`next start`), `lint`/`check` (`ultracite check`), `fix` (`ultracite fix`), `typecheck` (`tsc --noEmit`); plan 002 adds `test`/`test:watch`.
  - No `.env*` files exist and no code reads custom env vars — zero configuration required.
  - Next.js runs on a pinned preview build with `cacheComponents` (see `AGENTS.md`'s warning that this Next version differs from public docs).
  - Blog content: markdown in `content/blog/`, wired via `source.config.ts` (fumadocs-mdx); a new post = new `.md` file with `title`, `description`, `publishedAt` frontmatter.
  - Sample audio pipeline: `scripts/generate-sample-audio.py`, macOS-only — if plan 008 landed, its README section already covers this; do not duplicate.

## Commands you will need

| Purpose | Command         | Expected on success |
| ------- | --------------- | ------------------- |
| Install | `bun install`   | exit 0              |
| Dev     | `bun run dev`   | serves on :3000     |
| Lint    | `bun run check` | clean               |

## Scope

**In scope**:

- `README.md`
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- `AGENTS.md` / `CLAUDE.md` — agent-facing docs are fine as-is.
- Any source or config file.
- Rewriting the product-description paragraph (plan 001 governs marketing truth; the README paragraph describes the intended product and may stay).

## Git workflow

- Branch: `advisor/010-readme` (or fold into another advisor branch if executing in a batch)
- One commit; message style: short imperative lowercase.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the Getting started section

Append to `README.md` (after the product paragraph), adjusting the script table to whatever `package.json` currently contains:

```markdown
## Getting started

Requires [bun](https://bun.sh). No environment variables are needed.

    bun install
    bun run dev        # http://localhost:3000

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `bun run dev`       | Dev server                      |
| `bun run build`     | Production build                |
| `bun run start`     | Serve the production build      |
| `bun run check`     | Lint + format check (Ultracite) |
| `bun run fix`       | Auto-fix lint/format issues     |
| `bun run typecheck` | TypeScript check                |

Note: this project runs a pinned Next.js preview build with Cache Components enabled — see `AGENTS.md` before assuming stable-Next behavior.

## Content

Blog posts live in `content/blog/*.md` (frontmatter: `title`, `description`, `publishedAt` as `YYYY-MM-DD`); they are wired up via `source.config.ts`.
```

Add a `bun run test` row only if the script exists. Skip the audio-pipeline section if plan 008 already documented it; otherwise add plan 008's Step 5 text.

**Verify**: every command in the table exists in `package.json` scripts (`grep '"scripts"' -A 12 package.json`); `bun install && bun run dev` starts and `http://localhost:3000` renders.

### Step 2: Format check

**Verify**: `bun run check` → clean (Ultracite formats markdown too; run `bun x ultracite fix` if needed).

## Test plan

None — documentation. The gate is Step 1's "follow your own instructions" check: run the documented commands verbatim on the current checkout.

## Done criteria

- [ ] README contains install/dev instructions and a script table matching `package.json` exactly
- [ ] `bun run check` → clean
- [ ] Only `README.md` modified (`git status`, besides `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- A documented command fails on a clean checkout (that's a real finding, not a docs problem).
- `README.md` has been substantially rewritten since plan time — reconcile rather than append blindly.

## Maintenance notes

- When the SaaS build begins (auth, database, env vars), this section must grow a Configuration part — the "no environment variables" claim has a shelf life.
- Reviewer: check the script table against `package.json` at review time, not against this plan.
