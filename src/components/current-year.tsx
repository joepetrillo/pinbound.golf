"use client";

import { useId } from "react";

// The inline script handles hard loads; client rendering handles soft loads.
// The window guard keeps the unstable date read out of server prerendering.
export const CurrentYear = () => {
  const id = useId();
  return (
    <>
      <time id={id} suppressHydrationWarning>
        {typeof window === "undefined" ? null : new Date().getFullYear()}
      </time>
      <script
        // oxlint-disable-next-line react/no-danger -- static script, no user input
        dangerouslySetInnerHTML={{
          __html: `{var n=document.getElementById("${id}");if(n)n.textContent=new Date().getFullYear()}`,
        }}
        suppressHydrationWarning
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      />
    </>
  );
};
