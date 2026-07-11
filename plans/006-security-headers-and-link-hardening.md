# Plan 006: Add security headers and harden MDX link rendering

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- next.config.ts src/mdx-components.tsx` If either file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: MED (a too-strict CSP can break the Next/three.js/next-themes runtime — test each surface)
- **Depends on**: none
- **Category**: security (hardening — no active vulnerability)
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

The site requests **microphone access** (`navigator.mediaDevices.getUserMedia` in `src/components/ui/live-waveform.tsx`, used by the demo section) and runs WebGL, but serves no `Content-Security-Policy` or `Permissions-Policy` headers — `next.config.ts` has no `headers()` at all. Separately, the MDX link renderer emits any non-internal href verbatim into an `<a>` with no `rel` attribute and no scheme allowlist. Blog content is in-repo and trusted today, so neither is an active vulnerability — this is cheap defense-in-depth appropriate for a public marketing site that will later grow into a SaaS (per `docs/pinbound-product-context.md`, this repo becomes the full product application).

## Current state

Verified at commit `8a40ad9`:

- `next.config.ts` (entire config):

  ```ts
  const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
  };
  ```

  Wrapped with `createMDX()` from `fumadocs-mdx/next`. No `headers()`.

- `src/mdx-components.tsx:4-17`:

  ```tsx
  const isInternalHref = (href: string): boolean =>
    href.startsWith("/") || href.startsWith("#");

  const mdxComponents = {
    a: ({ children, href, ...props }) =>
      href && isInternalHref(href) ? (
        <Link href={href} {...props}>
          {children}
        </Link>
      ) : (
        <a href={href} {...props}>
          {children}
        </a>
      ),
  } satisfies MDXComponents;
  ```

  Notes: `href.startsWith("/")` also matches protocol-relative `//host` URLs (routed into `<Link>`); the external branch emits any scheme, including `javascript:`. No `target="_blank"` is set anywhere, so tabnabbing is NOT a live concern — the `rel` addition is for future-proofing if targets are ever added.

- Runtime surfaces a CSP must not break (test each): next-themes injects an **inline script** in `<head>` for the theme flash guard (`suppressHydrationWarning` on `<html>` in `src/app/layout.tsx` is the tell); Next.js itself uses inline scripts/styles; the orb uses WebGL (`blob:`/`data:` workers are possible with three.js); Google fonts are self-hosted via `next/font` (no external font origin needed); audio is same-origin (`/audio/*.m4a`); no external images or analytics exist at plan time.
- This is a Next.js **preview** build — before writing the headers config, read the config docs in `node_modules/next/dist/docs/` (search for "headers") to confirm the `headers()` API shape hasn't changed from stable Next.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run check` | clean |
| Build | `bun run build` | exit 0 |
| Dev | `bun run dev` | serves on :3000 |
| Header check | `curl -sI http://localhost:3000 \| grep -i 'content-security\|permissions-policy'` | both headers present |

## Scope

**In scope** (the only files you should modify):

- `next.config.ts`
- `src/mdx-components.tsx`
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- Adding a nonce-based strict CSP with middleware — over-engineered for a static marketing site; use a header-based policy with `'unsafe-inline'` where required.
- Blog content files.
- Any deployment-platform header config (e.g. `vercel.json`) — keep headers in the app so they follow the app.

## Git workflow

- Branch: `advisor/006-security-headers`
- Message style: short imperative lowercase.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add `headers()` to `next.config.ts`

Add to `nextConfig` (confirm API shape against `node_modules/next/dist/docs/` first):

```ts
headers: async () => [
  {
    source: "/(.*)",
    headers: [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "media-src 'self'",
          "font-src 'self'",
          "connect-src 'self'",
          "worker-src 'self' blob:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
      { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
  },
],
```

Note `'unsafe-eval'` may be needed only in dev (React refresh); test the production build — if `bun run build && bun run start` works without it, drop it from the list.

**Verify**: `bun run typecheck` → exit 0; `bun run build` → exit 0.

### Step 2: Exercise every surface against the CSP

Run `bun run build && bun run start`, then in a browser with the console open:

1. Load `/` in light and dark system themes → no CSP violation errors, no theme flash.
2. Scroll to `/#demo`, tap the orb (WebGL loads), play a sample call, drag the scrubber.
3. Visit `/blog` and one post; visit `/contact`, `/get-started`.
4. Check the console/network tab for `Content-Security-Policy` violation reports.

If any violation appears, loosen ONLY the specific directive the console names (e.g. add `blob:` to a directive three.js needs) — record what and why in the commit message.

**Verify**: `curl -sI http://localhost:3000 | grep -i "content-security-policy"` → header present; zero CSP violations in console across all four checks.

### Step 3: Harden the MDX link renderer (`src/mdx-components.tsx`)

Replace the component with scheme-checked rendering, preserving the existing internal/external split:

```tsx
const isInternalHref = (href: string): boolean =>
  (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#");

const SAFE_EXTERNAL_PROTOCOL = /^(https?:|mailto:)/iu;

// external branch:
SAFE_EXTERNAL_PROTOCOL.test(href) ? (
  <a href={href} rel="noopener noreferrer" {...props}>
    {children}
  </a>
) : (
  <span>{children}</span> // unknown scheme: render text, drop the link
);
```

Keep the `satisfies MDXComponents` typing and top-level regex (repo convention — see `src/lib/blog.ts:26-27` for top-level regex constants).

**Verify**: `bun run typecheck` → exit 0; `bun run dev`, open a blog post containing an external link (`content/blog/tee-sheet-integrations.md` or grep `content/blog` for `http`) → external links render with `rel="noopener noreferrer"` (inspect element), internal links still client-navigate.

### Step 4: Full gate

**Verify**: `bun run check && bun run typecheck && bun run build` → all exit 0. If plan 002 landed, `bun run test` → all pass.

## Test plan

Manual surface checks in Step 2 are the core (CSP correctness is environmental, not unit-testable here). If plan 002 landed, add one unit test for `isInternalHref`-equivalent behavior IF it is exported; if it is not exported, skip (do not export it just to test).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `curl -sI http://localhost:3000` (prod build via `bun run start`) shows `Content-Security-Policy` and `Permissions-Policy` headers
- [ ] Zero CSP violations across the Step 2 checklist
- [ ] `grep -n "noopener" src/mdx-components.tsx` → 1 match
- [ ] `bun run typecheck`, `bun run check`, `bun run build` all exit 0
- [ ] Only in-scope files modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The Next preview's `headers()` API differs from the documented shape and the docs in `node_modules/next/dist/docs/` don't resolve the difference.
- Making the CSP pass requires directives looser than `'unsafe-inline'`/`'unsafe-eval'`/`blob:`/`data:` (e.g. an external origin you can't explain) — report the exact violation message.
- `cacheComponents`/`partialPrefetching` interact badly with `headers()` (e.g. build error naming those flags).

## Maintenance notes

- When the SaaS app arrives (auth, dashboards), revisit: the CSP should tighten (nonce-based `script-src`), and cookies will need `HttpOnly`/`Secure`/`SameSite` review — this plan's headers are the marketing-site baseline, not the product's.
- Any future analytics/embed vendor must be added to the CSP deliberately — that's the point.
- Reviewer: confirm `'unsafe-eval'` was dropped if the production build didn't need it.
