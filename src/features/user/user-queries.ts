import "server-only";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { connection } from "next/server";

import type { SignedInUser } from "@/features/user/types/user";

/**
 * The signed-in user, redirecting to sign-in when there is no session.
 *
 * Deliberately uncached: AuthKit resolves the request-scoped session forwarded
 * by the proxy, so this read is dynamic per request. Callers must sit inside a
 * `<Suspense>` boundary.
 *
 * `connection()` is required, not decorative. `withAuth` unseals the session
 * cookie via iron-session, whose TTL check calls `Date.now()` — an unstable
 * value that fails the Cache Components prerender with "Blocking Route".
 * Reading the proxy's header is not enough to defer it; this is.
 */
export const getSignedInUser = async (): Promise<SignedInUser> => {
  await connection();
  const { user } = await withAuth({ ensureSignedIn: true });

  return { email: user.email, firstName: user.firstName };
};
