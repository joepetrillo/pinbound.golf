import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

import { DASHBOARD_HREF } from "@/lib/site";

const redirectToSignUp = async () =>
  NextResponse.redirect(await getSignUpUrl({ returnTo: DASHBOARD_HREF }));

export { redirectToSignUp as GET };
