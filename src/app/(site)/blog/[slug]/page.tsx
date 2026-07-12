import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import {
  formatBlogDate,
  getBlogPost,
  getBlogPosts,
  getReadingTime,
} from "@/lib/blog";
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

const BlogPost = async ({
  params,
}: Pick<PageProps<"/blog/[slug]">, "params">) => {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const PostBody = post.data.body;

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
    </article>
  );
};

const BlogPostPage = ({ params }: PageProps<"/blog/[slug]">) => (
  <Section className="pt-16 md:pt-16">
    <BlogPost params={params} />
  </Section>
);

export default BlogPostPage;
