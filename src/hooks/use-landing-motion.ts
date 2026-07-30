"use client";

import { useEffect, useLayoutEffect } from "react";

const REVEAL_SELECTOR =
  "[data-reveal]:not([data-inview]), [data-reveal-group]:not([data-inview])";
const ENTRANCE_PREFIX = "arrive";
const SEEN_ATTRIBUTE = "data-arrival-seen";

// Fire slightly before the element's top reaches the bottom of the viewport, so
// a section has begun arriving by the time it is worth looking at.
const OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -12% 0px",
  threshold: 0.01,
};

/**
 * Whether this visitor has already watched the landing page arrive.
 *
 * Module scope, because it has to outlive the DOM. Cache Components keeps only
 * three routes alive at a time; visit a fourth and /home is evicted and rebuilt
 * from scratch, so anything recorded on the page's own elements is lost with
 * them. A full page load clears this, which is exactly the lifetime wanted: the
 * arrival plays once per document, however many times you navigate back to it.
 *
 * Written only from an animation event, so it is never touched while rendering
 * on the server, where module state is shared between requests.
 */
let arrivalSeen = false;

/**
 * The landing page's motion lives in `src/app/motion.css`. This supplies the two
 * facts CSS cannot work out on its own:
 *
 *   [data-inview] on a section    it has been scrolled to — begin its arrival
 *   [data-arrival-seen] on <html> this visitor has watched the arrival already
 *
 * The second is what holds the page still on the way back. Activity restores a
 * route by lifting `display: none`, and an element re-entering the display tree
 * builds its CSS animations again from frame 0 — so something has to say "not
 * this time", and it has to survive both that and a full rebuild after eviction.
 *
 * None of this is load-bearing for reading the page: the hidden pre-state is
 * gated on `@media (scripting: enabled)`, so with JavaScript off every section
 * renders visible and the hero still arrives on its own.
 */
export const useLandingMotion = () => {
  // Before paint, so a rebuilt or re-shown tree never flashes a frame of an
  // arrival it has already played.
  useLayoutEffect(() => {
    if (arrivalSeen) {
      document.documentElement.setAttribute(SEEN_ATTRIBUTE, "");
    }
  }, []);

  useEffect(() => {
    // Spending the arrival on *completion* is what keeps this safe under Strict
    // Mode: its extra mount/unmount pair happens synchronously, long before any
    // 900ms entrance can finish, so the rehearsal cannot mark the page as seen.
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
