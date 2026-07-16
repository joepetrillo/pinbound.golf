import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COMING_SOON_PATH = "/coming-soon";

const isProductionComingSoon = () =>
  process.env.VERCEL_ENV === "production" &&
  process.env.COMING_SOON_MODE === "true";

export const proxy = (request: NextRequest) => {
  if (
    !isProductionComingSoon() ||
    request.nextUrl.pathname === COMING_SOON_PATH
  ) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(COMING_SOON_PATH, request.url));
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:gif|ico|jpe?g|m4a|png|svg|webp)$).*)",
  ],
};
