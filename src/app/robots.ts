import type { MetadataRoute } from "next";

import { isProductionComingSoon } from "@/env.config";
import { SITE_URL } from "@/lib/site";

const robots = (): MetadataRoute.Robots => {
  if (isProductionComingSoon()) {
    return {
      host: SITE_URL,
      rules: {
        disallow: "/",
        userAgent: "*",
      },
    };
  }

  return {
    host: SITE_URL,
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
};

export default robots;
