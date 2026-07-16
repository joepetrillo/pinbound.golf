import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export const handleSignIn = async () => {
  const signInUrl = await getSignInUrl();
  return redirect(signInUrl);
};

export const GET = handleSignIn;
