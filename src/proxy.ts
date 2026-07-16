import { authkitProxy } from "@workos-inc/authkit-nextjs";

// AuthKit session management. Only /get-started needs session awareness today
// (so signed-in users skip the hosted sign-up screen); add product routes to
// the matcher as they are built.
export default authkitProxy();

export const config = { matcher: ["/get-started"] };
