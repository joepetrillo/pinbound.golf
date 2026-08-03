import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

import { blogPosts } from "collections/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import type { Route } from "next";

import type { BlogPostSummary } from "@/features/blog/types/blog";

const blog = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blogPosts, []),
});

type BlogPage = ReturnType<typeof blog.getPages>[number];

const blogDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

const formatBlogDate = (publishedAt: string): string =>
  blogDateFormatter.format(new Date(`${publishedAt}T00:00:00Z`));

const WORDS_PER_MINUTE = 220;
const FRONTMATTER_PATTERN = /^---[\s\S]*?---/u;
const WHITESPACE_PATTERN = /\s+/u;

const readReadingTime = (postPath: string): string => {
  const filePath = path.join(process.cwd(), "content/blog", postPath);
  const body = readFileSync(filePath, "utf-8").replace(FRONTMATTER_PATTERN, "");
  const wordCount = body.split(WHITESPACE_PATTERN).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
};

const toSummary = (page: BlogPage): BlogPostSummary => ({
  description: page.data.description,
  formattedDate: formatBlogDate(page.data.publishedAt),
  publishedAt: page.data.publishedAt,
  readingTime: readReadingTime(page.path),
  slug: page.slugs[0],
  title: page.data.title,
  url: page.url as Route,
});

/**
 * Every published post, newest first.
 *
 * Synchronous and uncached on purpose. Posts are MDX committed to the repo, so
 * the content is fixed for the lifetime of a deployment and every route that
 * reads it is prerendered at build time. Adding `use cache` here only stamps a
 * revalidate window onto pages that can never change without a new build.
 */
export const getBlogPostSummaries = (): BlogPostSummary[] =>
  blog
    .getPages()
    .toSorted((firstPost, secondPost) =>
      secondPost.data.publishedAt.localeCompare(firstPost.data.publishedAt)
    )
    .map(toSummary);

export const getBlogPostSummary = (slug: string): BlogPostSummary | undefined =>
  getBlogPostSummaries().find((summary) => summary.slug === slug);

/** The full fumadocs page, including the compiled MDX body. */
export const getBlogPost = (slug: string) => blog.getPage([slug]);

const RELATED_POST_OFFSETS = [1, -1, 2, -2] as const;
const RELATED_POST_LIMIT = 2;

/** Neighbouring posts, nearest first, for the "Keep reading" rail. */
export const getRelatedBlogPostSummaries = (
  slug: string
): BlogPostSummary[] => {
  const summaries = getBlogPostSummaries();
  const currentIndex = summaries.findIndex((summary) => summary.slug === slug);

  if (currentIndex === -1) {
    return [];
  }

  const relatedPosts: BlogPostSummary[] = [];

  for (const offset of RELATED_POST_OFFSETS) {
    const summary = summaries[currentIndex + offset];
    if (summary) {
      relatedPosts.push(summary);
    }

    if (relatedPosts.length === RELATED_POST_LIMIT) {
      break;
    }
  }

  return relatedPosts;
};
