import { authkit, handleAuthkitProxy } from "@workos-inc/authkit-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isProductionComingSoon, workOSIsConfigured } from "@/env/server";

const COMING_SOON_PATH = "/coming-soon";
const DASHBOARD_PATH = "/dashboard";
const AUTH_PATH = "/auth";
const MARKETING_HOME_PATH = "/home";

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (isProductionComingSoon()) {
    if (pathname !== COMING_SOON_PATH) {
      return NextResponse.rewrite(new URL(COMING_SOON_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (pathname === AUTH_PATH || pathname.startsWith(`${AUTH_PATH}/`)) {
    return workOSIsConfigured()
      ? NextResponse.next()
      : NextResponse.redirect(new URL(MARKETING_HOME_PATH, request.url));
  }

  const isDashboard =
    pathname === DASHBOARD_PATH || pathname.startsWith(`${DASHBOARD_PATH}/`);
  const isRootDocumentRequest =
    pathname === "/" && (request.method === "GET" || request.method === "HEAD");

  if (!(isDashboard || isRootDocumentRequest)) {
    return NextResponse.next();
  }

  if (!workOSIsConfigured()) {
    return isDashboard
      ? NextResponse.redirect(new URL(MARKETING_HOME_PATH, request.url))
      : NextResponse.next();
  }

  const { authorizationUrl, headers, session } = await authkit(request);

  if (isDashboard && !session.user && authorizationUrl) {
    return handleAuthkitProxy(request, headers, {
      redirect: authorizationUrl,
    });
  }

  if (isRootDocumentRequest && session.user) {
    return handleAuthkitProxy(request, headers, {
      redirect: DASHBOARD_PATH,
    });
  }

  return handleAuthkitProxy(request, headers);
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:gif|ico|jpe?g|m4a|png|svg|webp)$).*)",
  ],
};
