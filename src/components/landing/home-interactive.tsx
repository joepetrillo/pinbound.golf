"use client";

import { Fragment, useState } from "react";
import type { ReactNode } from "react";

import { useResetOnHide } from "@/hooks/use-reset-on-hide";

/**
 * Remounts the home page tree when Cache Components hides the route via
 * Activity, so interactive UI (tabs, mic, accordion, audio) starts fresh
 * without close-animation flashes.
 */
export const HomeInteractive = ({ children }: { children: ReactNode }) => {
  const [visitKey, setVisitKey] = useState(0);

  useResetOnHide(() => {
    setVisitKey((key) => key + 1);
  });

  return <Fragment key={visitKey}>{children}</Fragment>;
};
