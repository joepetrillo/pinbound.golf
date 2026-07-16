import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const isProductionPrelaunch = () =>
  process.env.VERCEL_ENV === "production" &&
  process.env.COMING_SOON_MODE === "true";

const robots = (): MetadataRoute.Robots => {
  if (isProductionPrelaunch()) {
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
