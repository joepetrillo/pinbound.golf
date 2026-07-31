import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getBlogPost,
  getBlogPostSummary,
  getRelatedBlogPostSummaries,
} from "@/features/blog/blog-queries";
import { PostCardList } from "@/features/blog/components/post-card-list";
import { CTA_HREF, CTA_LABEL, DEMO_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getMDXComponents } from "@/mdx-components";

const MetaBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="h-8 bg-background px-4 text-sm" variant="outline">
    {children}
  </Badge>
);

const crossArmClass = "absolute bg-muted-foreground";

const RuleCross = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none relative size-4.5 shrink-0"
  >
    <span className={`${crossArmClass} top-1/2 h-px w-full -translate-y-1/2`} />
    <span
      className={`${crossArmClass} left-1/2 h-full w-px -translate-x-1/2`}
    />
  </span>
);

const ArticleNextStep = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">
        Hear the operating model in action
      </CardTitle>
      <CardDescription className="leading-relaxed text-balance">
        Listen to sample calls for bookings, policy questions, weather, and
        human handoff.
      </CardDescription>
    </CardHeader>
    <CardFooter className="flex-wrap gap-2">
      <Link
        className={cn(buttonVariants({ variant: "outline" }))}
        href={DEMO_HREF}
      >
        Hear sample calls
      </Link>
      <a className={cn(buttonVariants())} href={CTA_HREF}>
        {CTA_LABEL}
      </a>
    </CardFooter>
  </Card>
);

export const BlogPost = ({ slug }: { slug: string }) => {
  const post = getBlogPost(slug);
  const summary = getBlogPostSummary(slug);

  if (!post || !summary) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPostSummaries(slug);

  const PostBody = post.data.body;

  return (
    <article>
      <header>
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-medium tracking-tight text-balance md:text-5xl lg:text-6xl">
              {summary.title}
            </h1>
          </div>
          <p className="max-w-md leading-relaxed text-balance text-muted-foreground md:justify-self-end md:text-right">
            {summary.description}
          </p>
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-3 sm:hidden">
          <MetaBadge>
            <time dateTime={summary.publishedAt}>{summary.formattedDate}</time>
          </MetaBadge>
          <MetaBadge>{summary.readingTime}</MetaBadge>
        </p>
        <div className="relative mt-6 flex items-center sm:mt-10 md:mt-12">
          <span
            aria-hidden="true"
            className="absolute inset-x-2.5 top-1/2 h-px -translate-y-1/2 bg-border"
          />
          <RuleCross />
          <p className="relative ml-3 hidden items-center gap-3 sm:flex">
            <MetaBadge>
              <time dateTime={summary.publishedAt}>
                {summary.formattedDate}
              </time>
            </MetaBadge>
            <MetaBadge>{summary.readingTime}</MetaBadge>
          </p>
          <span className="min-w-4 flex-1" />
          <RuleCross />
        </div>
      </header>

      <div className="typeset typeset-docs mx-auto mt-12 max-w-[37em]">
        <PostBody components={getMDXComponents()} />
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <ArticleNextStep />

        {relatedPosts.length > 0 ? (
          <section aria-labelledby="related-articles-heading" className="mt-16">
            <h2
              className="text-2xl font-medium tracking-tight md:text-3xl"
              id="related-articles-heading"
            >
              Keep reading
            </h2>
            <PostCardList headingLevel="h3" posts={relatedPosts} />
          </section>
        ) : null}
      </div>
    </article>
  );
};
