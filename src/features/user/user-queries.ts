import "server-only";
import { withAuth } from "@workos-inc/authkit-nextjs";

import type { SignedInUser } from "@/features/user/types/user";

/**
 * The signed-in user, redirecting to sign-in when there is no session.
 *
 * Deliberately uncached: it reads the AuthKit session cookie, so it is dynamic
 * per request. Callers must sit inside a `<Suspense>` boundary.
 */
export const getSignedInUser = async (): Promise<SignedInUser> => {
  const { user } = await withAuth({ ensureSignedIn: true });

  return {
    email: user.email,
    firstName: user.firstName,
    id: user.id,
  };
};
