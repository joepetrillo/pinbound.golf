import { getSignUpUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

// /get-started is the stable public CTA. It hands off to the WorkOS AuthKit
// hosted sign-up flow so marketing links never depend on auth internals.
const handleGetStarted = async () => {
  let destination: string;
  try {
    const { user } = await withAuth();
    // Already signed in: skip sign-up and go to the post-auth destination.
    destination = user ? "/" : await getSignUpUrl();
  } catch {
    // Missing or invalid WorkOS configuration fails closed — never fall back
    // to an email-based page.
    return new Response("Sign-up is temporarily unavailable.", {
      status: 503,
    });
  }
  redirect(destination);
};

export const GET = handleGetStarted;
