import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ReadingTime } from "@/components/blog/reading-time";
import { Section } from "@/components/section";
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
  formatBlogDate,
  getBlogPost,
  getBlogPosts,
  getRelatedBlogPosts,
  getReadingTime,
} from "@/lib/blog";
import { CTA_HREF, CTA_LABEL, DEMO_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getMDXComponents } from "@/mdx-components";

export const instant = false;

export const generateStaticParams = (): { slug: string }[] =>
  getBlogPosts().map((post) => ({ slug: post.slugs[0] }));

export const generateMetadata = async ({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return {
    description: post.data.description,
    title: `${post.data.title} — Pinbound`,
  };
};

const MetaBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="h-8 bg-background px-4 text-sm" variant="outline">
    {children}
  </Badge>
);

const crossArmClass = "absolute bg-muted-foreground";

const RuleCross = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none relative size-[18px] shrink-0"
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
        human handoff—or tell us how your course handles the phone today.
      </CardDescription>
    </CardHeader>
    <CardFooter className="flex-wrap gap-2">
      <Link
        className={cn(buttonVariants({ variant: "outline" }))}
        href={DEMO_HREF}
      >
        Hear sample calls
      </Link>
      <Link className={cn(buttonVariants())} href={CTA_HREF}>
        {CTA_LABEL}
      </Link>
    </CardFooter>
  </Card>
);

const BlogPost = async ({
  params,
}: Pick<PageProps<"/blog/[slug]">, "params">) => {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const PostBody = post.data.body;
  const relatedPosts = getRelatedBlogPosts(slug);

  return (
    <article>
      <header>
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-medium tracking-tight text-balance md:text-5xl lg:text-6xl">
              {post.data.title}
            </h1>
          </div>
          <p className="max-w-md leading-relaxed text-balance text-muted-foreground md:justify-self-end md:text-right">
            {post.data.description}
          </p>
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-3 sm:hidden">
          <MetaBadge>
            <time dateTime={post.data.publishedAt}>
              {formatBlogDate(post.data.publishedAt)}
            </time>
          </MetaBadge>
          <MetaBadge>{getReadingTime(post)}</MetaBadge>
        </p>
        <div className="relative mt-6 flex items-center sm:mt-10 md:mt-12">
          <span
            aria-hidden="true"
            className="absolute inset-x-[10px] top-1/2 h-px -translate-y-1/2 bg-border"
          />
          <RuleCross />
          <p className="relative ml-3 hidden items-center gap-3 sm:flex">
            <MetaBadge>
              <time dateTime={post.data.publishedAt}>
                {formatBlogDate(post.data.publishedAt)}
              </time>
            </MetaBadge>
            <MetaBadge>{getReadingTime(post)}</MetaBadge>
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
            <ul className="mt-6 grid gap-px overflow-hidden rounded-4xl border bg-border bg-clip-padding md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <li
                  className="bg-background odd:last:md:col-span-2"
                  key={relatedPost.url}
                >
                  <Link
                    className="group flex h-full scroll-mt-14 flex-col gap-4 p-8 transition-colors hover:bg-muted/50 focus-visible:rounded-4xl focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 md:p-10"
                    href={relatedPost.url}
                  >
                    <time
                      className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase"
                      dateTime={relatedPost.data.publishedAt}
                    >
                      {formatBlogDate(relatedPost.data.publishedAt)}
                    </time>
                    <h3 className="text-2xl font-medium tracking-tight text-balance md:text-3xl">
                      {relatedPost.data.title}
                    </h3>
                    <p className="leading-relaxed text-pretty text-muted-foreground">
                      {relatedPost.data.description}
                    </p>
                    <div className="mt-auto pt-4">
                      <ReadingTime label={getReadingTime(relatedPost)} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
};

const BlogPostPage = ({ params }: PageProps<"/blog/[slug]">) => (
  <Section className="pt-16 md:pt-16">
    <BlogPost params={params} />
  </Section>
);

export default BlogPostPage;
