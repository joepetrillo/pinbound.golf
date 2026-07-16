import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export const handleSignUp = async () => {
  const signUpUrl = await getSignUpUrl();
  return redirect(signUpUrl);
};

export const GET = handleSignUp;
