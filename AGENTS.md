<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ultracite-code-standards -->

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable. Rules are enforced mechanically via `oxlint.config.ts` (extends `ultracite/oxlint/{core,js-plugins,next,react}`) — don't restate them here, just run the commands above.

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun x ultracite fix` before committing to ensure compliance.

<!-- END:ultracite-code-standards -->

## App Architecture

Feature-sliced React Server Components. The `nextjs-app-architecture` skill has the full rules and rationale; this section is the short form.

### Layout

```
src/app/          Pages, layouts, route handlers — composition only
src/features/     Domain folders (blog, contact, landing, user)
src/components/   UI primitives (ui/) and app-shell singletons (site-header, site-footer)
src/data/         Shared provider clients (Resend) — secret-backed, server-only
src/lib/          Non-domain helpers (site constants, cn, safe-action client)
```

A feature folder is named for a domain noun and its files carry that prefix:

```
src/features/<domain>/
  <domain>-queries.ts     import "server-only"  — reads
  <domain>-actions.ts     "use server"          — mutations
  <domain>-schema.ts                            — validation contract, client-safe
  components/                                   — server + client components, each with its skeleton
  types/                                        — types shared by several files in the feature
  hooks/                                        — feature-local client hooks
```

Sub-concepts fold into the parent feature rather than getting their own folder.

### Pages compose, they never fetch

- `page.tsx` / `layout.tsx` hold static chrome, `<Suspense>` boundaries, and error boundaries. No queries, no route-specific components defined inline.
- Feature components receive plain values (`slug`, `id`, parsed filters) or already-fetched records — never `params` / `searchParams`.
- **A route with no dynamic hole needs no boundary and no skeleton.** When content is fully known at build time — local MDX with every slug prerendered by `generateStaticParams` — a skeleton would never render, and the route should declare `export const instant = false`. See `app/(site)/blog/[slug]/page.tsx`. Add a boundary because a read actually streams at request time, not reflexively.
- **A route that does stream** keeps its page synchronous and resolves route props with `params.then()` / `searchParams.then()` instead of `await params`, so the chrome commits into the static shell while only the data-dependent section suspends. This only pays off with a `<Suspense>` boundary to suspend into — with no boundary, the promise suspends past the chrome anyway and `.then()` buys nothing over `await`. No route needs this today; both blog routes are `instant = false` and `/dashboard` takes no params.
- The page owns the `<Suspense>` boundary; the feature exports the skeleton. Skeletons live in the same file as their component, defined at the end.
- Skeletons match the real component's *classes*, not its tags. `Skeleton` renders a `<div>`, so anywhere the real markup uses `<p>`/`<span>` to wrap what becomes a placeholder, the skeleton uses `<div>` — otherwise it is invalid HTML and hydration breaks.
- Wrap fallible suspending sections in `SectionErrorBoundary` (`src/components/section-error-boundary.tsx`, built on `catchError`) so one failed read doesn't take down the route.

### Data access

- Keep Server Actions and Route Handlers thin: validate untrusted input, then delegate to the feature's query/delivery module.
- Mark every read/write module `import "server-only"`; keep provider SDKs, secret-backed clients, and authorization close to the data source. Shared provider clients stay in `src/data/`.
- Return minimal, **serializable** DTOs. This is enforced, not stylistic: `use cache` cannot serialize functions or class instances, so anything that crosses a cache boundary must be plain data. See `BlogPostSummary` — the fumadocs page object can't be cached because its MDX body is a component.
- Client-safe contracts (Zod schemas, DTO types) live outside the server-only modules so the client can import them.

### Cache Components

`cacheComponents: true` and `partialPrefetching: true` are on.

- Cache reusable reads with `"use cache"` + `cacheTag()` + `cacheLife()` when the data can change independently of a deploy (a database, a remote API). Don't leave such a read dynamic just because `<Suspense>` makes the build pass.
- **Don't cache build-time content.** Data baked into the deployment — MDX in `content/`, anything read from the repo — is already fixed for the life of the build, and every route reading it is prerendered. `use cache` there buys nothing and *costs* a revalidate window: pages that can only change on deploy get regenerated on a timer to produce identical output. Keep those reads plain and synchronous; the build output should show `revalidate=False`. See `blog-queries.ts`.
- Leave a read dynamic only when it genuinely must be per-request (session/cookie reads), and say why in a comment — see `getSignedInUser`.
- Invalidate by tag: `updateTag()` in server actions, `revalidateTag(tag, "max")` in route handlers. `refresh()` is only for dynamic reads with no tag.
