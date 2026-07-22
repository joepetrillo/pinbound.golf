# Plan 001: Migrate the blog to Satteri local Markdown without changing behavior

> **Executor instructions**: Follow this plan in order. Run every verification command and confirm its expected result before continuing. Do not overwrite, discard, stage, or reformat unrelated working-tree changes. If a STOP condition occurs, stop and report it instead of improvising. When complete, update this plan's row in `advisor-plans/README.md` unless the reviewer says they maintain the index.
>
> **Drift check (run first)**:
>
> ```sh
> git diff --stat 2bd7f8b -- package.json bun.lock next.config.ts tsconfig.json source.config.ts .gitignore src/lib/blog.ts 'src/app/(site)/blog/page.tsx' 'src/app/(site)/blog/[slug]/page.tsx' src/app/sitemap.ts src/mdx-components.tsx content/blog
> ```
>
> This repository already had uncommitted changes when the plan was written. Compare the live files with the “Current state” section below. Existing edits called out there are intentional and must survive the migration.

## Status

- **Priority**: P1
- **Effort**: M (about one day including characterization and dev-HMR checks)
- **Risk**: MED — the source and renderer both change, and Cache Components can make an apparently working route less static
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `2bd7f8b`, 2026-07-22, against the then-current dirty working tree

## Why this matters

The blog currently relies on `fumadocs-mdx` code generation through `.source/`. The target is `@fumadocs/satteri/local-md`, which reads and compiles local Markdown without generated collection files. The migration is successful only if it removes that codegen path while preserving the current public contract: the same nine URLs, order, metadata, dates, reading times, related-post choices, GFM tables and links, custom component rendering, sitemap entries, development hot reload, and Next.js Cache Components prerender behavior.

Production content is deployment-scoped today: changing a Markdown file takes a rebuild/deploy. Keep that contract. Use a one-time `staticSource()` snapshot in production, but use `dynamicSource()` with the local-md dev watcher during development. Do not turn the production blog into a runtime-revalidating or request-time filesystem feature merely because the dynamic loader is the documentation default.

## Current state and behavior contract

### Repository and framework facts

- Package manager: Bun (`bun.lock`).
- Framework: Next.js `16.3.0-preview.7` with React `19.2.8`.
- `next.config.ts:7-10` enables both `cacheComponents: true` and `partialPrefetching: true`.
- The post route intentionally exports `instant = false` at `src/app/(site)/blog/[slug]/page.tsx:28`. Next's local documentation says this opts out of instant-navigation validation but does not force dynamic rendering.
- Baseline commands succeeded on 2026-07-22: `bun run typecheck`, `bun run check`, and `bun run build`.
- Baseline build output reports `/blog` as static and emits all nine post paths; the prerender manifest records `initialRevalidateSeconds: false` for the blog index and generated post routes.

Before writing code, read these version-matched local Next.js guides:

- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md`
- `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`

Also read the current Fumadocs Satteri local Markdown guide: `https://www.fumadocs.dev/docs/integrations/content/satteri-local-md`.

### Existing source pipeline

`source.config.ts:6-20` defines the `content/blog` collection, validates required `description` and ISO-date `publishedAt` fields, and deliberately uses the minimal MDX preset plus GFM:

```ts
export const blogPosts = defineCollections({
  dir: "content/blog",
  schema: pageSchema.extend({
    description: z.string().min(1),
    publishedAt: z.iso.date(),
  }),
  type: "doc",
});

export default defineConfig({
  mdxOptions: {
    preset: "minimal",
    remarkPlugins: [remarkGfm],
  },
});
```

`src/lib/blog.ts:13-16` turns the generated collection into a synchronous loader. Its helpers sort by newest `publishedAt`, calculate reading time at 220 words per minute using `Math.round()` with a one-minute floor, and choose adjacent related posts with offsets `[1, -1, 2, -2]`, limited to two.

The exact ordered behavior to preserve is:

| Slug | Published | Reading time | Related slugs |
| --- | --- | --- | --- |
| `natural-ai-voice-hard-rules` | 2026-07-10 | 5 min read | `why-courses-miss-calls`, `tee-sheet-integrations` |
| `why-courses-miss-calls` | 2026-07-02 | 4 min read | `tee-sheet-integrations`, `natural-ai-voice-hard-rules` |
| `tee-sheet-integrations` | 2026-06-24 | 4 min read | `after-hours-answering`, `why-courses-miss-calls` |
| `after-hours-answering` | 2026-06-15 | 3 min read | `handoff-to-a-human`, `tee-sheet-integrations` |
| `handoff-to-a-human` | 2026-06-05 | 4 min read | `rain-check-policy-calls`, `after-hours-answering` |
| `rain-check-policy-calls` | 2026-05-27 | 4 min read | `outing-inquiries`, `handoff-to-a-human` |
| `outing-inquiries` | 2026-05-19 | 4 min read | `what-callers-actually-ask`, `rain-check-policy-calls` |
| `what-callers-actually-ask` | 2026-05-12 | 4 min read | `setting-up-in-an-afternoon`, `outing-inquiries` |
| `setting-up-in-an-afternoon` | 2026-05-04 | 4 min read | `what-callers-actually-ask`, `outing-inquiries` |

### Satteri API facts that remove ambiguity

- Install `@fumadocs/satteri`, `@fumadocs/local-md`, and `shiki`. `@fumadocs/satteri/local-md` provides `localMd()` and the compiler integration; the separate `@fumadocs/local-md` package provides the `local-md` CLI used by the development script. This is not an optional follow-up decision.
- Satteri's local-md integration exposes `title` and `description` directly on `page.data`, but the full validated object is under `page.data.frontmatter`. Use `page.data.title` for the normalized title and `page.data.frontmatter.description` / `.publishedAt` for required frontmatter.
- `page.data.content` is the Markdown body after frontmatter has been removed. It is the correct input for the existing reading-time algorithm.
- Rendering is:

  ```ts
  const renderer = await post.data.load();
  const { body } = await renderer.render(getMDXComponents());
  ```

- The renderer accepts the existing `MDXComponents` type. Keep `@types/mdx` and leave `src/mdx-components.tsx` unchanged.
- Satteri enables GFM parsing, but explicitly retain `preset: "minimal"` and `features: { gfm: true }` in `satteriOptions`. The default Fumadocs Satteri preset adds heading, image, code-tab, npm, structure, syntax-highlighting, table, and TOC plugins that the current minimal pipeline does not use. Defaulting to that preset would be a behavior expansion, not parity.
- `shiki` is still a direct dependency required by the documented package setup, even though the minimal preset disables syntax highlighting. Do not add code highlighting or theme behavior during this migration.

### Existing uncommitted edits that must survive

- `next.config.ts` includes `withBotId`, imports `@/env.config`, and keeps `cacheComponents` plus `partialPrefetching`. Remove only `createMDX()` and the `withMDX(...)` wrapper.
- `src/app/(site)/blog/page.tsx` contains the current `md:grid-cols-[1fr_3fr]` layout and `text-balance` empty state.
- `src/app/(site)/blog/[slug]/page.tsx` contains the shortened CTA copy and an external `<a>` for `CTA_HREF`.
- `src/app/sitemap.ts` uses `isProductionComingSoon()` and intentionally omits `/get-started` from `staticRoutes`.
- `src/mdx-components.tsx` contains the keyboard-focusable scrollable table and custom link behavior. Do not replace or reformat it.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Install/update lockfile | `bun install` | exit 0; `bun.lock` updated |
| Focused tests | `bun test src/lib/blog.test.tsx` | all blog tests pass |
| Typecheck | `bun run typecheck` | exit 0, no errors |
| Lint/format check | `bun run check` | exit 0, all files formatted |
| Build | `bun run build` | exit 0; all nine blog posts generated |
| Stale-reference scan | Run the Step 9 `rg` command | no matches |
| Removed lockfile package | `rg -n 'fumadocs-mdx' bun.lock` | no matches; transitive `remark-gfm` from `fumadocs-core` is allowed |

Use `bun x ultracite fix` only on the migration files and only if the check fails because of those files. Never use formatting to rewrite unrelated user changes.

## Scope

**In scope** (the only source files to modify or create):

- `package.json`
- `bun.lock` (generated by `bun install`)
- `next.config.ts`
- `tsconfig.json`
- `.gitignore`
- `source.config.ts` (delete)
- `src/lib/blog.ts`
- `src/lib/blog.test.tsx` (create)
- `src/app/(site)/blog/page.tsx`
- `src/app/(site)/blog/[slug]/page.tsx`
- `src/app/sitemap.ts`
- `advisor-plans/README.md` (status only)

**Out of scope** (do not modify):

- `content/blog/**` — content, filenames, frontmatter, and URLs stay byte-for-byte unchanged.
- `src/mdx-components.tsx` — already compatible; its UI behavior is a regression target, not a migration target.
- Blog layout, cards, typography, CTA copy, metadata wording, date formatting, reading-time UI, related-post algorithm, robots behavior, and coming-soon logic.
- Any use of Fumadocs docs UI, page trees, TOC, search, RSS, or OG-image features.
- Cache Components configuration, Partial Prefetching configuration, or route `instant` policy.
- Unrelated application, environment, authentication, contact, landing-page, or onboarding changes already present in the working tree.

## Git workflow

- If the operator wants a branch and the existing dirty changes have already been safely committed or otherwise accounted for, use `codex/migrate-satteri-local-md`.
- Do not stash, reset, clean, or switch branches while uncommitted user work is present unless the operator explicitly asks.
- Match the repository's short imperative commit style; suggested message: `migrate blog markdown to satteri local-md`.
- Stage only the in-scope files. Do not push or open a PR unless instructed.

## Steps

### Step 1: Capture the current behavior before changing dependencies

Run the baseline commands first:

```sh
bun run typecheck
bun run check
bun run build
```

Save a filtered prerender contract outside the repository so the migration can compare against it without committing build artifacts:

```sh
node -e 'const p=require("./.next/prerender-manifest.json"); const pick=([route,value])=>({route,renderingMode:value.renderingMode,experimentalPPR:value.experimentalPPR,initialRevalidateSeconds:value.initialRevalidateSeconds,srcRoute:value.srcRoute}); const routes=Object.entries(p.routes).filter(([route])=>route==="/blog"||route.startsWith("/blog/")).map(pick); const dynamic=Object.entries(p.dynamicRoutes).filter(([route])=>route.startsWith("/blog")).map(pick); process.stdout.write(JSON.stringify({routes,dynamic},null,2)+"\n")' > /tmp/pinbound-blog-prerender-before.json
```

Also save the in-scope diff so preserving pre-existing changes is reviewable:

```sh
git diff 2bd7f8b -- next.config.ts package.json 'src/app/(site)/blog/page.tsx' 'src/app/(site)/blog/[slug]/page.tsx' src/app/sitemap.ts src/mdx-components.tsx > /tmp/pinbound-blog-preexisting.patch
```

**Verify**: all three commands exit 0; the JSON contains `/blog`, nine concrete `/blog/<slug>` routes, and `/blog/[slug]`; the saved patch contains the BotID, blog layout/CTA, sitemap, and MDX-component edits described above.

### Step 2: Replace dependencies and remove only the MDX wrapper

Update `package.json`:

- add `@fumadocs/satteri`, `@fumadocs/local-md`, and `shiki` to dependencies;
- remove `fumadocs-mdx` and direct `remark-gfm`;
- keep `fumadocs-core`;
- keep `@types/mdx`;
- change `dev` to `local-md dev -- next dev`;
- do not change unrelated dependency versions.

Run `bun install` to update `bun.lock`.

In `next.config.ts`, delete the `fumadocs-mdx/next` import and `createMDX()` wrapper, leaving this composition:

```ts
export default withBotId(nextConfig);
```

Preserve the environment import and both Next flags. Do not add `serverExternalPackages` speculatively. If the build produces a Shiki-specific bundling/externalization error, add `serverExternalPackages: ["shiki"]` while keeping the existing flags, then rerun the build. Do not use this escape hatch for unrelated build errors.

**Verify**:

```sh
bun pm ls | rg '@fumadocs/(satteri|local-md)|shiki'
node -e 'const p=require("./package.json"); for (const name of ["@fumadocs/satteri","@fumadocs/local-md","shiki"]) { if (!p.dependencies?.[name]) process.exit(1) } for (const name of ["fumadocs-mdx","remark-gfm"]) { if (p.dependencies?.[name] || p.devDependencies?.[name]) process.exit(1) }'
rg -n 'fumadocs-mdx' bun.lock
```

Expected: the first command shows the three target packages; the Node assertion exits 0; the final `rg` returns no matches. A transitive GFM package inside `fumadocs-core` is acceptable; the manifest must not list it directly.

### Step 3: Remove generated-source configuration

- Delete `source.config.ts`.
- Remove `"collections/*": ["./.source/*"]` from `tsconfig.json`, leaving the `@/*` alias intact.
- Remove `/.source/` from `.gitignore`.
- Remove the local `.source/` directory only after the old pipeline is no longer referenced. It is ignored/generated and must not be committed.

Do not use a broad clean command; remove only the resolved repository path `/Users/jpetrillo/Documents/Projects/pinbound.golf/.source`.

**Verify**:

```sh
test ! -e source.config.ts
test ! -e .source
rg -n 'collections/server|collections/\*|fumadocs-mdx' src next.config.ts tsconfig.json package.json .gitignore
```

Expected: both `test` commands exit 0 and `rg` returns no matches.

### Step 4: Rebuild `src/lib/blog.ts` around explicit dev and production modes

Keep `formatBlogDate`, `WORDS_PER_MINUTE`, `WHITESPACE_PATTERN`, `RELATED_POST_OFFSETS`, `RELATED_POST_LIMIT`, and the related-post selection algorithm unchanged.

Replace the generated collection with:

```ts
const blogContent = localMd({
  dir: "content/blog",
  frontmatterSchema: pageSchema.extend({
    description: z.string().min(1),
    publishedAt: z.iso.date(),
  }),
  satteriOptions: {
    preset: "minimal",
    features: { gfm: true },
  },
});
```

Implement two environment-specific source paths behind one async internal `getBlogSource()` function:

- development: connect `watchWithDevServer(blogContent)` and use `dynamicLoader(blogContent.dynamicSource(), { baseUrl: "/blog" })`;
- non-development (including test and production): create one memoized `blogContent.staticSource()` promise and pass its resolved source to `loader(..., { baseUrl: "/blog" })`.

Do not call `staticSource()` on every helper invocation. Do not create both source modes eagerly in the same environment. `process.env.NODE_ENV` should make the branch explicit and allow Next to eliminate the unused development watcher from production.

Convert the content helpers to async:

- `getBlogPost(slug)` awaits the source then calls `getPage([slug])`;
- `BlogPost` is `NonNullable<Awaited<ReturnType<typeof getBlogPost>>>`;
- `getBlogPosts()` awaits the source, sorts with `post.data.frontmatter.publishedAt`, and returns the same order;
- `getRelatedBlogPosts(slug)` awaits `getBlogPosts()` and preserves the existing offset algorithm exactly;
- `getReadingTime(post)` remains synchronous but reads `post.data.content`, so remove `node:fs`, `node:path`, and `FRONTMATTER_PATTERN`.

Do not add `'use cache'` to a helper returning Fumadocs page/loader objects; those objects contain functions such as `load()`. The acceptance criterion is the actual Next prerender output, not forcing these objects through a cache boundary.

**Verify**:

```sh
bun run typecheck
```

Expected: exit 0; no casts to `any`, no non-null assertions, and no old collection or filesystem imports remain in `src/lib/blog.ts`.

### Step 5: Update consumers while preserving their rendered UI

In `src/app/(site)/blog/page.tsx`:

- make `BlogPage` async;
- await `getBlogPosts()`;
- replace `post.data.publishedAt` with `post.data.frontmatter.publishedAt`;
- use validated `post.data.frontmatter.description` while keeping `post.data.title`, all JSX, classes, empty state, and reading-time calls.

In `src/app/(site)/blog/[slug]/page.tsx`:

- keep `export const instant = false` unchanged;
- make `generateStaticParams` async and await all posts;
- await `getBlogPost()` in metadata and page rendering;
- await `getRelatedBlogPosts()`;
- access required custom fields via `post.data.frontmatter`;
- replace the component-valued `post.data.body` path with:

  ```ts
  const renderer = await post.data.load();
  const { body } = await renderer.render(getMDXComponents());
  ```

  Render `{body}` inside the existing `typeset` container. Do not change that container or any surrounding article UI.

In `src/app/sitemap.ts`:

- make the exported sitemap function async;
- keep the early `isProductionComingSoon()` return exactly as-is;
- await `getBlogPosts()` after that early return;
- read `lastModified` from `post.data.frontmatter.publishedAt`;
- keep static routes and URL construction unchanged.

Do not modify `src/mdx-components.tsx`. Pass `getMDXComponents()` directly to Satteri's renderer.

**Verify**:

```sh
bun run typecheck
bun run check
```

Expected: both exit 0. Inspect `git diff` and confirm the pre-existing layout, CTA, sitemap, BotID, and scrollable-table edits are still present.

### Step 6: Add focused regression tests for the behavior being preserved

Create `src/lib/blog.test.tsx` using Bun's built-in test runner. Test public helpers rather than private loader construction.

Required cases:

1. `getBlogPosts()` returns exactly the nine slugs in the order listed in the behavior table above.
2. Every post exposes the same `publishedAt` value and reading-time label listed above.
3. Related posts match at least the first, one middle, and last rows above; an unknown slug returns `[]`.
4. `getBlogPost("rain-check-policy-calls")` returns the expected title, description, and date; an unknown slug returns no page.
5. Load and render `rain-check-policy-calls` with `getMDXComponents()`, convert the returned React node with `renderToStaticMarkup`, and assert the output contains a table inside the existing `aria-label="Scrollable data table"` wrapper plus the known external USGA link. This characterizes GFM and the custom component map together.

Do not write a broad snapshot of the entire HTML document; it would couple the test to harmless compiler serialization details. Assert semantic markers.

**Verify**:

```sh
bun test src/lib/blog.test.tsx
```

Expected: all focused tests pass without opening a watcher or websocket in `NODE_ENV=test`.

### Step 7: Prove static and Cache Components parity from build artifacts

Run a clean production build without deleting unrelated files:

```sh
bun run build
```

Create the same filtered post-migration contract:

```sh
node -e 'const p=require("./.next/prerender-manifest.json"); const pick=([route,value])=>({route,renderingMode:value.renderingMode,experimentalPPR:value.experimentalPPR,initialRevalidateSeconds:value.initialRevalidateSeconds,srcRoute:value.srcRoute}); const routes=Object.entries(p.routes).filter(([route])=>route==="/blog"||route.startsWith("/blog/")).map(pick); const dynamic=Object.entries(p.dynamicRoutes).filter(([route])=>route.startsWith("/blog")).map(pick); process.stdout.write(JSON.stringify({routes,dynamic},null,2)+"\n")' > /tmp/pinbound-blog-prerender-after.json
diff -u /tmp/pinbound-blog-prerender-before.json /tmp/pinbound-blog-prerender-after.json
```

Also confirm every known static HTML artifact exists and includes content:

```sh
for slug in natural-ai-voice-hard-rules why-courses-miss-calls tee-sheet-integrations after-hours-answering handoff-to-a-human rain-check-policy-calls outing-inquiries what-callers-actually-ask setting-up-in-an-afternoon; do test -s ".next/server/app/blog/$slug.html" || exit 1; done
rg -l 'Scrollable data table' .next/server/app/blog/rain-check-policy-calls.html .next/server/app/blog/tee-sheet-integrations.html .next/server/app/blog/natural-ai-voice-hard-rules.html
```

Expected:

- build exits 0;
- the filtered prerender contract has no diff;
- `/blog` and all nine concrete post pages remain prerendered;
- `initialRevalidateSeconds` remains `false`;
- Cache Components/PPR fields match the baseline;
- no route has silently become request-only dynamic;
- all three table-bearing articles include the custom scrollable table marker.

If the manifest format itself changed solely because dependency installation changed Next.js, verify that `package.json` did not change Next. If Next stayed at the same resolved version, treat a blog contract difference as a migration failure, not as expected drift.

### Step 8: Verify development hot reload

Start the configured development command:

```sh
bun run dev
```

Open `/blog/rain-check-policy-calls`. Make a temporary, unmistakable text-only edit in that Markdown file, confirm the browser updates without restarting the Next process, then immediately revert only that temporary line by editing it back manually. Do not use `git checkout` or another broad restore command.

Confirm the watcher came from the local-md dev server and no duplicate watcher, port, or websocket errors appeared.

**Verify**:

```sh
git diff --exit-code -- content/blog
```

Expected: exit 0; content files are unchanged after the HMR check.

### Step 9: Run final gates and review scope

Run:

```sh
bun test src/lib/blog.test.tsx
bun run typecheck
bun run check
bun run build
rg -n 'fumadocs-mdx|collections/server|collections/\*|remark-gfm|\.source' package.json next.config.ts tsconfig.json src .gitignore
git status --short
git diff --check
```

Expected:

- tests, typecheck, check, and build all pass;
- stale-reference scan has no matches;
- `git diff --check` has no whitespace errors;
- only the in-scope migration files plus pre-existing unrelated user changes are modified;
- `content/blog/**` and `src/mdx-components.tsx` have no migration diff;
- the pre-existing changes saved in `/tmp/pinbound-blog-preexisting.patch` are still represented in the live diff.

## Test plan summary

- Characterization before migration: baseline typecheck, lint, build, filtered prerender manifest, and saved pre-existing diff.
- Unit/integration coverage: exact posts, order, dates, reading times, related selection, known/unknown lookup, Satteri render, GFM table, custom component wrapper, and external link.
- Build coverage: all nine static HTML outputs and exact Cache Components/PPR manifest parity.
- Manual development coverage: Markdown edit propagates through the companion local-md watcher without restarting Next.

## Done criteria

- [ ] `fumadocs-mdx`, direct `remark-gfm`, `source.config.ts`, `.source/`, and the `collections/*` alias are gone.
- [ ] `@fumadocs/satteri`, `@fumadocs/local-md`, and `shiki` are direct dependencies; `@types/mdx` remains.
- [ ] Production uses one static source snapshot; development uses the dynamic source plus watcher.
- [ ] All nine content files, slugs, frontmatter values, ordering, reading times, and related-post choices are unchanged.
- [ ] Satteri renders through the existing MDX component map; table and link behavior is covered by a focused test.
- [ ] `/blog`, all nine post pages, and `/sitemap.xml` build successfully.
- [ ] The filtered prerender manifest matches the pre-migration baseline, including `initialRevalidateSeconds: false` and Cache Components/PPR fields.
- [ ] `instant = false`, `cacheComponents: true`, and `partialPrefetching: true` remain unchanged.
- [ ] Development Markdown hot reload works and leaves `content/blog/**` clean.
- [ ] `bun test src/lib/blog.test.tsx`, `bun run typecheck`, `bun run check`, and `bun run build` all exit 0.
- [ ] Pre-existing user edits are preserved and no out-of-scope files are staged.
- [ ] `advisor-plans/README.md` marks Plan 001 DONE only after every criterion passes.

## STOP conditions

Stop and report instead of improvising if:

- Any in-scope live file no longer matches the current-state facts or contains new user edits that overlap the migration.
- The baseline typecheck, check, or build fails before migration changes.
- The installed package API differs from the documented `@fumadocs/satteri/local-md` API (`localMd`, `staticSource`, `dynamicSource`, `load().render()`, or watcher import path).
- `preset: "minimal"` plus explicit GFM does not render current tables and links.
- Static production source initialization requires a runtime content filesystem, adds request-time compilation, or causes a known post to disappear from the prerender manifest.
- The post-migration manifest differs in rendering mode, PPR fields, generated paths, or revalidation behavior.
- Passing page/loader objects through a Cache Components directive appears necessary. Do not add `'use cache'`, Suspense, `connection()`, `dynamicParams`, or route-dynamic configuration as a workaround without architectural review.
- HMR requires changing the production loader contract or modifying content files.
- A verification fails twice after a scoped correction.
- The migration appears to require any out-of-scope file.

## Maintenance notes

- New posts remain deployment-scoped in production and should be added through a rebuild/deploy. The development watcher is convenience, not a production CMS.
- Custom frontmatter lives under `page.data.frontmatter`; normalized `title` is also available at `page.data.title`. Future custom fields should be read from the validated frontmatter object.
- Keep the direct `shiki` dependency while using the documented Satteri setup, even though this blog intentionally uses the minimal preset. If syntax highlighting is introduced later, treat it as a separate behavior change with visual and bundle-size review.
- Review future Next upgrades against the version-matched Cache Components docs and keep the prerender-contract test/check current; route labels alone are less precise than `.next/prerender-manifest.json`.
- A reviewer should scrutinize environment branching in `src/lib/blog.ts`, ensure the production source is memoized exactly once, and confirm no dev watcher code is active in tests or production.
