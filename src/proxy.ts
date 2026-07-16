import { authkitProxy } from "@workos-inc/authkit-nextjs";

export default authkitProxy();

// Match against pages that require auth
export const config = { matcher: ["/dashboard"] };
