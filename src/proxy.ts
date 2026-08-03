import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";
import type { Route } from "next";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isProductionComingSoon } from "@/env.config";
import { DASHBOARD_HREF } from "@/lib/site";

const COMING_SOON_PATH = "/coming-soon" satisfies Route;

const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Pre-launch wall. Gates the whole site, so it runs before any session work.
  if (isProductionComingSoon() && pathname !== COMING_SOON_PATH) {
    return NextResponse.rewrite(new URL(COMING_SOON_PATH, request.url));
  }

  const { authorizationUrl, headers, session } = await authkit(request);

  // Signed-in visitors get the app at "/". "/home" stays marketing for everyone.
  if (pathname === "/" && session.user) {
    return handleAuthkitHeaders(request, headers, { redirect: DASHBOARD_HREF });
  }

  // Signed-out visitors are sent to AuthKit and returned here afterwards.
  if (
    pathname.startsWith(DASHBOARD_HREF) &&
    !session.user &&
    authorizationUrl
  ) {
    return handleAuthkitHeaders(request, headers, {
      redirect: authorizationUrl,
    });
  }

  return handleAuthkitHeaders(request, headers);
};

export default proxy;

export const config = {
  matcher: [
    // Exclude Next/Vercel internals, BotID's rewrite namespace, and public assets.
    "/((?!_next(?:/|$)|__nextjs_|_vercel(?:/|$)|149e9513-01fa-4fb0-aad4-566afd725d1b(?:/|$)|audio(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|opengraph-image$).*)",
  ],
};
