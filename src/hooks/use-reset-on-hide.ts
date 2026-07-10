"use client";

import { useEffectEvent, useLayoutEffect } from "react";

/**
 * Runs `reset` when Cache Components hides this tree via React Activity
 * (soft navigation away). State is preserved across navigations by default;
 * call this for interactive UI that should feel like a fresh page load.
 */
export const useResetOnHide = (reset: () => void) => {
  const onHide = useEffectEvent(reset);

  useLayoutEffect(
    () => () => {
      onHide();
    },
    // onHide is an Effect Event — intentionally omitted from deps.
    []
  );
};
