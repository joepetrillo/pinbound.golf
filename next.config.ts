import { withBotId } from "botid/next/config";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

import "@/env.config";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

const withMDX = createMDX();

export default withBotId(withMDX(nextConfig));
