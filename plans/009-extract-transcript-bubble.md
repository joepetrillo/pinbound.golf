# Plan 009: Extract the duplicated transcript message bubble into a shared component

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8a40ad9..HEAD -- src/components/landing/hero.tsx src/components/landing/human-handoff.tsx src/components/ui/message.tsx` Plans 001 (copy) and 004 (message.tsx export pruning) may have touched these files — expected. If the bubble markup itself changed, re-verify the excerpts below before proceeding; a structural mismatch is a STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 004 (touches `message.tsx` first); 002 recommended (test gate)
- **Category**: tech-debt
- **Planned at**: commit `8a40ad9`, 2026-07-10

## Why this matters

The chat-style transcript bubble — the visual signature of the product's call transcripts — is duplicated: `hero.tsx` and `human-handoff.tsx` each hand-roll a `div` with the same Tailwind classes, the same agent/caller styling branch, and the same `data-slot="message-bubble"` marker, but no shared component exists behind that slot name. A styling change to "what a transcript line looks like" must currently be made twice and has already diverged in one detail (`max-w-[70%]` vs `max-w-[90%]`). Extracting one `MessageBubble` closes the gap and gives future transcript surfaces (dashboard, blog embeds) the primitive they'll want.

## Current state

Verified at commit `8a40ad9`:

- `src/components/landing/hero.tsx:297-315` (inside the animated transcript, a `"use client"` component):

  ```tsx
  <Message align={isAgent ? "start" : "end"}>
    <MessageContent>
      <div
        className={cn(
          "w-fit max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-pretty",
          isAgent
            ? "border bg-background text-foreground"
            : "bg-muted text-foreground"
        )}
        data-slot="message-bubble"
      >
        <KaraokeLine ... />
      </div>
    </MessageContent>
  </Message>
  ```

- `src/components/landing/human-handoff.tsx:37-52` (server component):

  ```tsx
  <Message align={isAgent ? "start" : "end"} key={line.id}>
    <MessageContent>
      <div
        className={cn(
          "w-fit max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isAgent
            ? "border bg-background text-foreground"
            : "bg-muted text-foreground"
        )}
        data-slot="message-bubble"
      >
        {line.text}
      </div>
    </MessageContent>
  </Message>
  ```

  Differences to preserve: hero has `text-pretty` and `max-w-[70%]`; handoff has `max-w-[90%]` and plain text children.

- `src/components/ui/message.tsx` — home of `Message`/`MessageContent`; follows the shadcn primitive idiom: plain function component, `data-slot` attribute, `cn(...)` merging a base class string with a `className` prop (see `Message` at `:15-31` for the exact pattern to imitate). After plan 004 it exports only `Message` and `MessageContent`.
- Line data types also duplicated (`ScriptLine.speaker: "agent" | "caller"` in hero vs `HandoffLine.role: "agent" | "caller"` in handoff) — NOT unified by this plan; both components keep their own data shapes and pass a boolean/variant to the bubble. (Unifying the data model would ripple into the karaoke timing code — not worth it.)
- Styling conventions: Tailwind 4, `cn` from `@/lib/utils`, class-variance-authority (`cva`) available (see `src/components/ui/button.tsx` for a cva exemplar) — but with a single two-way variant, a ternary matches `message.tsx`'s existing style better than cva.

## Commands you will need

| Purpose   | Command             | Expected on success |
| --------- | ------------------- | ------------------- |
| Typecheck | `bun run typecheck` | exit 0              |
| Lint      | `bun run check`     | clean               |
| Build     | `bun run build`     | exit 0              |
| Tests     | `bun run test`      | all pass (plan 002) |

## Scope

**In scope**:

- `src/components/ui/message.tsx` (add `MessageBubble`)
- `src/components/landing/hero.tsx` (consume it; no other changes)
- `src/components/landing/human-handoff.tsx` (consume it; no other changes)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- Unifying `ScriptLine`/`HandoffLine`/sample-call transcript data models (see above).
- `src/components/ui/message-scroller.tsx`, `KaraokeLine`, animation logic in hero.
- Visual redesign — rendered output must be pixel-identical.

## Git workflow

- Branch: `advisor/009-message-bubble`
- One commit; message style: short imperative lowercase.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add `MessageBubble` to `src/components/ui/message.tsx`

Follow the file's existing component pattern exactly (`Message` at `:15-31`):

```tsx
function MessageBubble({
  className,
  variant = "agent",
  ...props
}: React.ComponentProps<"div"> & { variant?: "agent" | "caller" }) {
  return (
    <div
      data-slot="message-bubble"
      data-variant={variant}
      className={cn(
        "w-fit rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
        variant === "agent"
          ? "border bg-background text-foreground"
          : "bg-muted text-foreground",
        className
      )}
      {...props}
    />
  );
}
```

Note: `max-w-*` and `text-pretty` are intentionally NOT in the base — the two call sites differ there and pass them via `className`. Add `MessageBubble` to the export statement.

**Verify**: `bun run typecheck` → exit 0.

### Step 2: Consume in both call sites

- `hero.tsx`: replace the bubble `div` with `<MessageBubble className="max-w-[70%] text-pretty" variant={isAgent ? "agent" : "caller"}>` keeping `KaraokeLine` as children; update the import from `@/components/ui/message`.
- `human-handoff.tsx`: replace with `<MessageBubble className="max-w-[90%]" variant={isAgent ? "agent" : "caller"}>{line.text}</MessageBubble>`; update the import.

**Verify**: `bun run typecheck && bun run check && bun run build` → all exit 0; `grep -rn 'data-slot="message-bubble"' src/` → exactly 1 match (in `message.tsx`).

### Step 3: Visual regression check

`bun run dev`, open `/`:

1. Hero transcript: agent bubbles left/bordered, caller bubbles right/muted, karaoke word-reveal animates, line width caps at ~70% of the card.
2. Human-handoff section: same bubble styling, width caps at ~90%. Compare against production/`main` if unsure.

**Verify**: both sections render identically to before.

## Test plan

If plan 002 landed, optional single test in a new `src/components/ui/message.test.tsx`: render `<MessageBubble variant="caller">hi</MessageBubble>` and assert `data-variant="caller"` and the `bg-muted` class; render agent variant and assert `border` class. Verification: `bun run test` → all pass. Skip if 002 hasn't landed.

## Done criteria

- [ ] `grep -rn 'data-slot="message-bubble"' src/` → exactly 1 match, in `src/components/ui/message.tsx`
- [ ] `grep -rn "rounded-2xl px-3.5 py-2.5" src/components/landing/` → no matches (markup no longer duplicated)
- [ ] `bun run typecheck`, `bun run check`, `bun run build` all exit 0
- [ ] Step 3 visual check passed
- [ ] Only in-scope files modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The bubble markup at either call site no longer matches the excerpts (someone restyled it — re-extract from what's actually there only if the two sites still match each other; otherwise report).
- hero.tsx's transcript animation misbehaves after the swap (the karaoke code measures/keys DOM nodes — if extraction changes behavior, revert and report rather than patching the animation).

## Maintenance notes

- Future transcript surfaces should use `MessageBubble` — if a third variant appears (e.g. "system"), that's the moment to switch the ternary to cva.
- Reviewer: confirm the rendered class lists are equivalent to the originals (order may differ; `tailwind-merge` handles conflicts).
