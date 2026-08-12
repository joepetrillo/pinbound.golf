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

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable. Rules are enforced mechanically via `oxlint.config.ts`.

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

<!-- BEGIN:app-architecture-info -->

# Overall App Architecture

This app uses feature-sliced React Server Components. Use the `nextjs-app-architecture` skill for the general workflow and this section for project-specific rules and exceptions. For framework mechanics, the installed, version-matched guides in `node_modules/next/dist/docs/` are the final source of truth.

## Project structure

```
src/app/          Route composition, metadata, and route handlers
src/features/     User-facing domains: blog, contact, landing, user
src/components/   UI primitives and app-shell singletons
src/data/         Shared, secret-backed provider clients
src/lib/          Non-domain helpers and cohesive infrastructure
```

A feature is a domain noun. Sub-concepts stay in the parent feature, and feature-level files carry the domain prefix:

```
src/features/<domain>/
  <domain>-queries.ts   # server-only reads
  <domain>-actions.ts   # server actions
  <domain>-schema.ts    # client-safe validation contracts
  components/
  hooks/
  types/
```

## Route composition

- Page and layout components compose static chrome, feature components, `<Suspense>`, and error boundaries. They do not contain domain reads, mutations, or route-specific component definitions.
- Framework exports such as `generateStaticParams` and `generateMetadata` may call feature queries. The page component itself must not fetch data.
- Type routes with generated `PageProps<"/route">`, `LayoutProps<"/route">`, and `RouteContext<"/route">` helpers.
- Resolve route props at the page boundary. Feature components receive plain values such as `slug`, `id`, or parsed filters, never `params` or `searchParams`.
- For a route that streams, keep the page synchronous and resolve route promises with `.then()` inside a page-owned `<Suspense>` boundary. The feature owns its skeleton, defined at the end of the same file. Add boundaries and skeletons only for reads that can actually suspend.
- Keep Server Components as parents and isolate hooks, event handlers, and browser APIs in the smallest practical Client Component leaves.
- Wrap fallible suspending sections in `SectionErrorBoundary` so one failed read does not take down the route.

## Blog exception

- `/blog` and `/blog/[slug]` intentionally export `instant = false`. Do not add a loading boundary or skeleton solely to make them instant.
- Blog content is local MDX fixed for the deployment. Generated slugs render statically; an unlisted slug blocks only long enough to reach the dedicated `notFound()` state.
- `dynamicParams` is unavailable when Cache Components is enabled. Do not add it as a way to control unknown blog slugs.

## Data access

- Query, delivery, and provider modules that touch server data or secrets use `import "server-only"`. Server Action modules use the `"use server"` directive.
- Keep Server Actions and Route Handlers thin: authenticate or authorize, validate untrusted input, then delegate to feature-owned query or delivery code.
- Keep provider SDKs, secret-backed clients, and authorization close to the data source. Shared provider clients live in `src/data/`.
- Return minimal serializable DTOs across cache, action, and Server-to-Client Component boundaries. Client-safe schemas and DTO types remain outside server-only modules.

## Cache Components

`cacheComponents: true` and `partialPrefetching: true` are on.

- Cache reusable database or remote API reads with `"use cache"`, `cacheTag()`, and `cacheLife()` when their data can change independently of a deployment.
- Do not cache build-time content such as local MDX. It changes only with a deployment, so a revalidation window adds work without adding freshness.
- Leave a read dynamic only when it genuinely must be evaluated per request, such as the session-backed `getSignedInUser`, and document why near the read.
- Invalidate by tag: `updateTag()` in server actions, `revalidateTag(tag, "max")` in route handlers. `refresh()` is only for dynamic reads with no tag.

<!-- END:app-architecture-info -->
