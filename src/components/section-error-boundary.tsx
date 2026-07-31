"use client";

import { catchError } from "next/error";
import type { ErrorInfo } from "next/error";

import { Button } from "@/components/ui/button";

/**
 * Component-level error boundary for a suspending section, so one failed read
 * doesn't take the whole route down to `error.tsx`.
 *
 * Built on `catchError` rather than a hand-rolled React boundary: it lets
 * Next's control-flow throws (`notFound()`, `redirect()`) pass through, and its
 * `retry()` re-runs the server render instead of only resetting client state.
 */
const SectionErrorFallback = (
  { title }: { title: string },
  { retry }: ErrorInfo
) => (
  <section
    aria-live="polite"
    className="mt-4 rounded-3xl border border-dashed p-8 text-center"
  >
    <p className="text-pretty text-muted-foreground">{title}</p>
    <Button className="mt-4" onClick={() => retry()} variant="outline">
      Try again
    </Button>
  </section>
);

export const SectionErrorBoundary = catchError(SectionErrorFallback);
