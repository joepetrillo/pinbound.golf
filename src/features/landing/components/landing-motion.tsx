"use client";

import type { ReactNode } from "react";

import { useLandingMotion } from "@/features/landing/hooks/use-landing-motion";

/**
 * Client boundary for the landing page's arrival motion, and nothing else. It
 * adds no markup, so the page stays a Server Component and the sections stay
 * unaware that motion exists.
 *
 * Deliberately unkeyed. Keying the landing tree rebuilt the DOM on every fresh
 * navigation, replaying the whole arrival for someone who had already watched
 * it. State that genuinely should not outlive a visit is reset where it lives
 * instead — see the transcript card in `hero.tsx` and the microphone in
 * `demo.tsx`.
 */
export const LandingMotion = ({ children }: { children: ReactNode }) => {
  useLandingMotion();

  return <>{children}</>;
};
