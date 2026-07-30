import Link from "next/link";

import { ReadingTime } from "@/components/blog/reading-time";
import { formatBlogDate, getReadingTime } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface PostCardListProps {
  // The index renders these under the page <h1>; related posts sit under the
  // "Keep reading" <h2>, so each call site picks the level that keeps the
  // document outline correct.
  headingLevel: "h2" | "h3";
  posts: BlogPost[];
}

export const PostCardList = ({
  headingLevel: Heading,
  posts,
}: PostCardListProps) => {
  if (posts.length === 0) {
    return null;
  }

  return (
    <ul className="mt-6 grid gap-px overflow-hidden rounded-4xl border bg-border bg-clip-padding md:grid-cols-2">
      {posts.map((post) => (
        <li className="bg-background odd:last:md:col-span-2" key={post.url}>
          <Link
            className="group flex h-full scroll-mt-14 flex-col gap-4 p-8 transition-colors ease-[ease] hover:bg-muted/50 focus-visible:rounded-4xl focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:duration-0 md:p-10"
            href={post.url}
          >
            <time
              className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase"
              dateTime={post.data.publishedAt}
            >
              {formatBlogDate(post.data.publishedAt)}
            </time>
            <Heading className="text-2xl font-medium tracking-tight text-balance md:text-3xl">
              {post.data.title}
            </Heading>
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
  );
};
