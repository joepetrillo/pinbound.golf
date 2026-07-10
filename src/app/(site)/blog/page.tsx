import { RiArrowRightLine } from "@remixicon/react";
import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/section";
import { formatBlogDate, getBlogPosts, getReadingTime } from "@/lib/blog";

export const metadata: Metadata = {
  description:
    "Notes on building a calmer, more capable pro shop. Articles, tips, and insights for golf pros and their teams.",
  title: "Blog — Pinbound",
};

const ReadingTime = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-foreground uppercase">
    {label}
    <RiArrowRightLine
      aria-hidden="true"
      className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
    />
  </span>
);

const BlogPage = () => {
  const [featuredPost, ...remainingPosts] = getBlogPosts();

  return (
    <Section className="pt-12 md:pt-12">
      <header className="grid gap-6 md:grid-cols-2 md:items-end">
        <h1 className="text-4xl font-medium tracking-tight text-balance md:text-6xl">
          Blog
        </h1>
        <p className="max-w-md leading-relaxed text-balance text-muted-foreground md:justify-self-end md:text-right">
          {metadata.description}
        </p>
      </header>

      {featuredPost ? (
        <Link
          className="group mt-14 block rounded-2xl border bg-muted/40 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2"
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
        <p className="mt-14 text-muted-foreground">
          Nothing published yet — check back soon.
        </p>
      )}

      {remainingPosts.length > 0 && (
        <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border bg-border bg-clip-padding md:grid-cols-2">
          {remainingPosts.map((post) => (
            <li className="bg-background odd:last:md:col-span-2" key={post.url}>
              <Link
                className="group flex h-full flex-col gap-4 p-8 transition-colors hover:bg-muted/40 focus-visible:rounded-2xl focus-visible:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 md:p-10"
                href={post.url}
              >
                <time
                  className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase"
                  dateTime={post.data.publishedAt}
                >
                  {formatBlogDate(post.data.publishedAt)}
                </time>
                <h2 className="text-2xl font-medium tracking-tight text-balance md:text-3xl">
                  {post.data.title}
                </h2>
                <p className="leading-relaxed text-pretty text-muted-foreground">
                  {post.data.description}
                </p>
                <div className="mt-auto pt-4">
                  <ReadingTime label={getReadingTime(post)} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

export default BlogPage;
