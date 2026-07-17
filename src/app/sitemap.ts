import type { MetadataRoute } from "next";

import { getBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const isProductionPrelaunch = () =>
  process.env.VERCEL_ENV === "production" &&
  process.env.COMING_SOON_MODE === "true";

const staticRoutes = [
  "",
  "/blog",
  "/contact",
  "/get-started",
  "/privacy",
  "/terms",
] as const;

const sitemap = (): MetadataRoute.Sitemap => {
  if (isProductionPrelaunch()) {
    return [];
  }

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
  }));

  const blogEntries: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    lastModified: post.data.publishedAt,
    url: `${SITE_URL}${post.url}`,
  }));

  return [...staticEntries, ...blogEntries];
};

export default sitemap;
