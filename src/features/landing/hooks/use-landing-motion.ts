"use client";

import { useEffect, useLayoutEffect } from "react";

const REVEAL_SELECTOR =
  "[data-reveal]:not([data-inview]), [data-reveal-group]:not([data-inview])";
const ENTRANCE_PREFIX = "arrive";
const SEEN_ATTRIBUTE = "data-arrival-seen";

// Reveal just before the section enters the viewport.
const OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -12% 0px",
  threshold: 0.01,
};

// Module scope survives Activity eviction and resets on a full document load.
// It is only mutated by a browser animation event, never during server render.
let arrivalSeen = false;

/**
 * Supplies the visibility and already-played attributes consumed by
 * `src/app/motion.css`. The CSS keeps content visible when scripting is absent.
 */
export const useLandingMotion = () => {
  // Restore the played state before paint to prevent a replay flash.
  useLayoutEffect(() => {
    if (arrivalSeen) {
      document.documentElement.setAttribute(SEEN_ATTRIBUTE, "");
    }
  }, []);

  useEffect(() => {
    // Mark completion, not mount, so Strict Mode rehearsal cannot spend it.
    const spendArrival = (event: AnimationEvent) => {
      if (event.animationName.startsWith(ENTRANCE_PREFIX)) {
        arrivalSeen = true;
      }
    };

    document.addEventListener("animationend", spendArrival);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                (entry.target as HTMLElement).dataset.inview = "";
                observer?.unobserve(entry.target);
              }
            }
          }, OBSERVER_OPTIONS)
        : null;

    for (const target of document.querySelectorAll<HTMLElement>(
      REVEAL_SELECTOR
    )) {
      if (observer) {
        observer.observe(target);
      } else {
        target.dataset.inview = "";
      }
    }

    return () => {
      document.removeEventListener("animationend", spendArrival);
      observer?.disconnect();
    };
  }, []);
};
