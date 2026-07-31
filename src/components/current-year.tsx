"use client";

import { useId } from "react";

// On hard navigations the inline script fills in the year during HTML
// parsing, before React loads. On soft navigations this component renders
// directly in the browser, so the year is computed inline and the script
// (served as text/plain) is inert. The `typeof window` guard keeps
// `new Date()` out of the server prerender, where it is a blocked
// unstable value.
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
