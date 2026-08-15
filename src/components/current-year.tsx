"use client";

import { useId } from "react";

// The inline script handles hard loads; client rendering handles soft loads.
// The DOM membership check keeps the unstable date read out of server prerendering.
export const CurrentYear = () => {
  const id = useId();
  const isDomAvailable = "window" in globalThis;

  return (
    <>
      <time id={id} suppressHydrationWarning>
        {isDomAvailable ? new Date().getFullYear() : null}
      </time>
      <script
        // oxlint-disable-next-line react/no-danger -- static script, no user input
        dangerouslySetInnerHTML={{
          __html: `{var n=document.getElementById("${id}");if(n)n.textContent=new Date().getFullYear()}`,
        }}
        suppressHydrationWarning
        type={isDomAvailable ? "text/plain" : "text/javascript"}
      />
    </>
  );
};
