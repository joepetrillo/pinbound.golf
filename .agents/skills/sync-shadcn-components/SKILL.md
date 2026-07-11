---
name: sync-shadcn-components
description: Audit and safely synchronize a project's installed official shadcn/ui components and theme CSS with the latest @shadcn registry. Use when asked to check for shadcn updates, compare local shadcn source with upstream, refresh shadcn components, review registry drift, or periodically bring copied shadcn components up to date while preserving local customizations and ignoring third-party registries.
---

# Sync shadcn Components

Load and follow the project's `shadcn` skill before doing anything else. Treat it as the authority for the current CLI, project context, registries, presets, and update rules.

Operate in two separate phases. Complete the audit and stop for the user's decision before changing the project.
Unless blocked, make the audit findings the first user-facing deliverable; do not ask for update preferences before the evidence is ready.

## Non-negotiable rules

- Use the project package runner and `shadcn@latest` CLI. Never fetch registry source directly from GitHub or another raw URL.
- Scope discovery and updates to official `@shadcn` registry items. Report but ignore files that cannot be mapped to an official item.
- Generate upstream candidates outside the live project, then format the candidates with the live project's formatter before comparing them.
- Preserve the user's working tree, including dirty and untracked files. Never run an overwrite command in the live project.
- Do not treat formatting-only differences as upstream changes.
- Do not replace local component customizations or theme values without explaining them and receiving explicit approval.

## Phase 1: audit only

### 1. Inspect the project

1. Read applicable repository instructions.
2. Require a `components.json`; otherwise stop with a concise explanation.
3. Run the shadcn skill's project-context command, normally `bunx --bun shadcn@latest info --json` for this project.
4. Record `packageManager`, `style`, `base`, `iconLibrary`, aliases, `resolvedPaths.ui`, `tailwindCssFile`, and the installed component list.
5. Run `shadcn@latest preset resolve --json` to capture the current preset when resolvable.
6. Read the project formatter configuration and scripts. In this repository, follow the repository instruction to use Ultracite.

Do not infer provenance solely from every file in the UI directory. For each installed component name, confirm that `shadcn@latest view @shadcn/<name>` succeeds. Include successful official items and classify the rest as excluded or unresolved.

### 2. Create an isolated candidate project

Run:

```bash
.agents/skills/sync-shadcn-components/scripts/create-audit-copy.sh "$PWD"
```

Capture the printed temporary path. The copy includes the current working-tree state but excludes Git metadata, dependencies, build output, and caches. Perform every mutating registry command in this copy only. Remove the copy after reporting or when it is no longer needed.

### 3. Generate the latest official candidates

In the isolated copy:

1. Run `shadcn@latest add @shadcn/<name> --dry-run` for each confirmed item and record all affected files.
2. Install the confirmed official items with `--overwrite --yes` in the copy. Never use these flags in the live project.
3. Include registry-created utility, hook, dependency manifest, and lockfile changes when they are necessary for an installed component.
4. If one item fails, continue auditing the others and report the failure.

Use explicit `@shadcn/<name>` addresses even if the CLI currently defaults to the official registry.

### 4. Normalize formatting before comparison

Format only the candidate component files and other human-authored affected files with the project's formatter. For this repository, run `bun x ultracite fix <candidate-files...>` from the isolated copy. If the formatter cannot target files, format the isolated copy and compare only the recorded affected paths.

Do not format the live project during the audit. Do not include lockfiles in source-formatting commands.

Compare each formatted candidate against the corresponding live file with a no-index diff. Classify an item as:

- `up to date`: no semantic difference remains after formatting;
- `different`: a semantic source difference remains;
- `missing locally` or `extra upstream`: the registry item changes its file set;
- `failed`: the candidate could not be generated or formatted;
- `excluded`: not confirmed as an official `@shadcn` item.

Describe meaningful differences as upstream API, behavior, accessibility, dependency, styling, or structure changes versus likely local customization. Be candid when provenance cannot be proven without historical base versions.

### 5. Audit theme CSS when safely resolvable

Use `tailwindCssFile` from shadcn project context; never invent another CSS file.

If the current preset resolves, create a separate isolated copy and use the official CLI to apply that same preset's latest theme to the copy only, using `apply <preset> --only theme` where supported. Format the candidate CSS and compare semantic theme tokens, `@theme` mappings, base-layer declarations, and required animations with the live CSS.

Treat existing color values and custom variables as local design choices. Recommend automatic CSS updates only for clearly new required tokens or framework mappings. Put upstream value changes in a separate opt-in part of the plan. If the preset is not resolvable, skip the CSS refresh and report why; do not guess.

### 6. Present findings and stop

Present, in this order:

1. A summary with counts for up to date, different, failed, and excluded items.
2. A compact component table with item, status, affected files, and change category.
3. Per-item explanations of meaningful differences. Include concise diffs or exact file references when useful, and suppress formatter-only noise.
4. A separate theme CSS and dependency section.
5. A numbered smart-merge plan identifying what would change, what local behavior would be preserved, validation commands, and any risky choices.
6. A direct request for approval, allowing the user to approve all, select components, select CSS separately, revise the plan, or decline.

Stop. Do not edit, install dependencies, format, or validate the live project until the user replies.

## Phase 2: update after approval

Limit work to the components and CSS choices the user approved.

1. Refresh stale audit data if the registry or working tree may have changed.
2. Run `shadcn@latest docs <approved-components...>` and consult the returned official documentation before merging.
3. Read each live file and its formatted candidate completely.
4. Smart-merge upstream fixes into the live project with `apply_patch`, preserving intentional local APIs, variants, styles, and accessibility behavior unless the approved plan says otherwise.
5. Add or update required dependencies with the project's package manager. Never copy a candidate lockfile over the live lockfile.
6. Merge approved CSS additions into `tailwindCssFile`. Preserve custom color values by default; change them only when separately approved.
7. Review every changed component against the shadcn skill's composition, icon, form, styling, base-library, and accessibility rules.
8. Run `bun x ultracite fix <changed-human-authored-files...>`, `bun x ultracite check`, relevant tests, and the proportionate build or runtime checks.
9. Report updated items, preserved customizations, dependency or CSS changes, validation results, and anything intentionally left different.

Never use `shadcn add --overwrite` in the live project. If a clean overwrite becomes the best option, explain why and ask for explicit approval before doing it.

## Cleanup

Remove temporary audit copies after their diffs are no longer needed. Never remove a path unless it was created by `create-audit-copy.sh` during the current run.
