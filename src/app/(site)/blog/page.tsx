import type { Metadata } from "next";
import Link from "next/link";

import { PostCardList } from "@/components/blog/post-card-list";
import { ReadingTime } from "@/components/blog/reading-time";
import { Section } from "@/components/section";
import { formatBlogDate, getBlogPosts, getReadingTime } from "@/lib/blog";

export const metadata: Metadata = {
  description:
    "Notes on building a calmer, more capable pro shop. Articles, tips, and insights for golf pros and their teams.",
  title: "Blog — Pinbound",
};

const BlogPage = () => {
  const [featuredPost, ...remainingPosts] = getBlogPosts();

  return (
    <Section className="pt-16 md:pt-16">
      <header className="grid gap-6 md:grid-cols-[1fr_3fr] md:items-end">
        <h1 className="text-4xl font-medium tracking-tight text-balance md:text-6xl">
          Blog
        </h1>
        <p className="max-w-md leading-relaxed text-balance text-muted-foreground md:justify-self-end md:text-right">
          {metadata.description}
        </p>
      </header>

      {featuredPost ? (
        <Link
          className="group mt-14 block scroll-mt-14 rounded-4xl border bg-muted/50 transition-colors ease-[ease] hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:duration-0"
          href={featuredPost.url}
        >
          <article className="flex flex-col gap-6 p-8 md:gap-8 md:p-12">
            <p className="flex items-center gap-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              <span
                aria-hidden="true"
                className="size-4 rounded-full bg-primary"
              />
              <span className="sr-only">New post,</span>
              <time dateTime={featuredPost.data.publishedAt}>
                {formatBlogDate(featuredPost.data.publishedAt)}
              </time>
            </p>
            <h2 className="max-w-3xl text-3xl font-medium tracking-tight text-balance md:text-5xl">
              {featuredPost.data.title}
            </h2>
            <p className="max-w-2xl leading-relaxed text-balance text-muted-foreground md:text-lg">
              {featuredPost.data.description}
            </p>
            <ReadingTime label={getReadingTime(featuredPost)} />
          </article>
        </Link>
      ) : (
        <p className="mt-14 text-balance text-muted-foreground">
          Nothing published yet — check back soon.
        </p>
      )}

      <PostCardList headingLevel="h2" posts={remainingPosts} />
    </Section>
  );
};

export default BlogPage;
