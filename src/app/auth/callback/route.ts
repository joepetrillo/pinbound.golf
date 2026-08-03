import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

import { DASHBOARD_HREF, MARKETING_HOME_HREF } from "@/lib/site";

// Fallback only — AuthKit returns the user to the page they were sent from.
export const GET = handleAuth({
  onError: ({ error, request }) => {
    console.error("AuthKit callback failed", {
      error,
      path: request.nextUrl.pathname,
    });
    return NextResponse.redirect(new URL(MARKETING_HOME_HREF, request.url));
  },
  returnPathname: DASHBOARD_HREF,
});
