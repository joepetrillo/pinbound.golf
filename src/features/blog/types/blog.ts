import type { Route } from "next";

/** Serializable metadata used by blog lists, route metadata, and the sitemap. */
export interface BlogPostSummary {
  description: string;
  /** Long-form display date, e.g. "March 4, 2026". */
  formattedDate: string;
  /** ISO date for the `datetime` attribute. */
  publishedAt: string;
  readingTime: string;
  slug: string;
  title: string;
  url: Route;
}
