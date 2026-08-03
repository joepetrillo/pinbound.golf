import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

import { DASHBOARD_HREF } from "@/lib/site";

const redirectToSignIn = async () =>
  NextResponse.redirect(await getSignInUrl({ returnTo: DASHBOARD_HREF }));

export { redirectToSignIn as GET };
