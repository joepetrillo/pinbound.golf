import { readFileSync } from "node:fs";
import path from "node:path";

import { blogPosts } from "collections/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

const blogDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

const blog = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blogPosts, []),
});

export const formatBlogDate = (publishedAt: string): string =>
  blogDateFormatter.format(new Date(`${publishedAt}T00:00:00Z`));

export const getBlogPost = (slug: string) => blog.getPage([slug]);

type BlogPost = NonNullable<ReturnType<typeof getBlogPost>>;

const WORDS_PER_MINUTE = 220;
const FRONTMATTER_PATTERN = /^---[\s\S]*?---/u;
const WHITESPACE_PATTERN = /\s+/u;

export const getReadingTime = (post: BlogPost): string => {
  const filePath = path.join(process.cwd(), "content/blog", post.path);
  const body = readFileSync(filePath, "utf-8").replace(FRONTMATTER_PATTERN, "");
  const wordCount = body.split(WHITESPACE_PATTERN).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
};

export const getBlogPosts = () =>
  blog
    .getPages()
    .toSorted((firstPost, secondPost) =>
      secondPost.data.publishedAt.localeCompare(firstPost.data.publishedAt)
    );
