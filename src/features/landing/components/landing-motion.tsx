"use client";

import type { ReactNode } from "react";

import { useLandingMotion } from "@/features/landing/hooks/use-landing-motion";

/** Markup-free client boundary for landing-page arrival motion. */
export const LandingMotion = ({ children }: { children: ReactNode }) => {
  useLandingMotion();

  return <>{children}</>;
};
