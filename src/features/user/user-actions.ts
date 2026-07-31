"use server";

import { signOut } from "@workos-inc/authkit-nextjs";

/**
 * Ends the AuthKit session and redirects. `signOut` clears the session cookie
 * itself, so there is no cached read to invalidate here.
 */
export const signOutAction = async (): Promise<void> => {
  await signOut();
};
