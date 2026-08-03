import Link from "next/link";

import { getBlogPostSummaries } from "@/features/blog/blog-queries";
import { PostCardList } from "@/features/blog/components/post-card-list";
import { ReadingTime } from "@/features/blog/components/reading-time";
import type { BlogPostSummary } from "@/features/blog/types/blog";

const FeaturedPost = ({ post }: { post: BlogPostSummary }) => (
  <Link
    className="group mt-14 block scroll-mt-14 rounded-4xl border bg-muted/50 transition-colors ease-[ease] hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:duration-0"
    href={post.url}
  >
    <article className="flex flex-col gap-6 p-8 md:gap-8 md:p-12">
      <p className="flex items-center gap-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
        <span aria-hidden="true" className="size-4 rounded-full bg-primary" />
        <span className="sr-only">New post,</span>
        <time dateTime={post.publishedAt}>{post.formattedDate}</time>
      </p>
      <h2 className="max-w-3xl text-3xl font-medium tracking-tight text-balance md:text-5xl">
        {post.title}
      </h2>
      <p className="max-w-2xl leading-relaxed text-balance text-muted-foreground md:text-lg">
        {post.description}
      </p>
      <ReadingTime label={post.readingTime} />
    </article>
  </Link>
);

export const BlogIndex = () => {
  const [featuredPost, ...remainingPosts] = getBlogPostSummaries();

  if (!featuredPost) {
    return (
      <p className="mt-14 text-balance text-muted-foreground">
        Nothing published yet — check back soon.
      </p>
    );
  }

  return (
    <>
      <FeaturedPost post={featuredPost} />
      <PostCardList headingLevel="h2" posts={remainingPosts} />
    </>
  );
};
