import { withBotId } from "botid/next/config";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

import "@/env.config";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
};

const withMDX = createMDX();

export default withBotId(withMDX(nextConfig));
