import { handleAuth } from "@workos-inc/authkit-nextjs";

// WorkOS AuthKit callback. Completes the code exchange, persists the session
// cookie, and forwards the user to the post-auth destination. Update
// returnPathname to the first onboarding screen once the product app exists.
export const GET = handleAuth({ returnPathname: "/" });
