/**
 * Serializable view of a published post. The fumadocs page object carries the
 * compiled MDX body as a component function, which cannot cross a `use cache`
 * boundary — cached reads return this DTO instead, and only the `[slug]` route
 * reaches for the uncached page to render the body.
 */
export interface BlogPostSummary {
  description: string;
  /** Long-form display date, e.g. "March 4, 2026". */
  formattedDate: string;
  /** ISO date for the `datetime` attribute. */
  publishedAt: string;
  readingTime: string;
  slug: string;
  title: string;
  url: string;
}
