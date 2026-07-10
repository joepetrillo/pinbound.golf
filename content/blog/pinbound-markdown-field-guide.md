---
title: The Pinbound markdown field guide
description: A useful sample post for checking the rhythm, hierarchy, and details of long-form writing before the real stories arrive.
publishedAt: "2026-07-10"
---

A busy pro shop rarely gets one kind of question at a time. This sample does the same thing for typography: it mixes plain paragraphs, structured lists, practical tables, and technical notes in one place so every element can earn its keep.

## When Saturday morning arrives

The first tee is full, the counter is three golfers deep, and the phone starts ringing. Pinbound is designed to make that moment feel calmer—not by changing the course's rules, but by following them consistently.

> Good automation should sound less like a shortcut and more like a teammate who already read the policy book.

That means the important details stay **clear**, the uncertain ones stay _appropriately uncertain_, and a caller can always ask for a person. Read more about the approach in the [product overview](/#product).

## A call flow, step by step

1. Answer with the course's approved greeting.
   - Confirm the caller's intent.
   - Ask only for the details needed to help.
2. Check the tee sheet or policy source before making a commitment.
3. Complete the request, explain the next step, or hand the call to the pro shop.

### Markup that means something

Long-form content includes more than paragraphs. Important language can be **strong**, supporting language can be _emphasized_, and an old rate can be ~~$72~~. Inline values such as `handoff: "always"` should be distinct without interrupting the sentence.

## Code and operating rules

Longer examples need their own block and horizontal scrolling when space gets tight.

```
const callPolicy = {
  afterHours: "answer",
  booking: "tee-sheet",
  handoff: "always",
} as const;
```

## A compact policy table

Tables should remain legible on a phone and scan quickly on a larger screen. This one compares a few common requests.

| Request         | First action            | Handoff      |
| --------------- | ----------------------- | ------------ |
| Book a tee time | Check live availability | If requested |
| Ask about rain  | Read today's policy     | If unclear   |
| Reach the shop  | Start a transfer        | Always       |

## A little shared language

**Shadow mode**

Pinbound listens and prepares suggested actions without completing them, giving the team a safe way to tune behavior.

**Policy fidelity**

The practice of following the course's written rules instead of improvising a plausible answer.

**Human handoff**

A clear path from the automated call to a person whenever the caller asks or the situation needs judgment.

### One small equation

Even a simple formula should sit comfortably in the reading flow. If _A_ is answer coverage, _C_ is answered calls, and _T_ is total calls, then `A = C / T`.

#### The fine print can still be readable

Smaller sections should feel subordinate, not disposable. They are a good home for caveats, implementation notes, or details that matter after the main idea is understood.

---

## Ready for the real stories

This page is intentionally broad, but the goal is simple: every future post should feel at home here without a pile of one-off classes. The content can stay semantic, and the reading experience can stay unmistakably Pinbound.
