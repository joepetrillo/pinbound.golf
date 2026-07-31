import type { MetadataRoute } from "next";

import { isProductionComingSoon } from "@/env.config";
import { getBlogPostSummaries } from "@/features/blog/blog-queries";
import { SITE_URL } from "@/lib/site";

const staticRoutes = ["", "/blog", "/contact", "/privacy", "/terms"] as const;

const sitemap = (): MetadataRoute.Sitemap => {
  if (isProductionComingSoon()) {
    return [];
  }

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));

  const blogEntries: MetadataRoute.Sitemap = getBlogPostSummaries().map(
    (summary) => ({
      lastModified: summary.publishedAt,
      url: `${SITE_URL}${summary.url}`,
    })
  );

  return [...staticEntries, ...blogEntries];
};

export default sitemap;
