import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/section";
import {
  getBlogPostSummaries,
  getBlogPostSummary,
} from "@/features/blog/blog-queries";
import { BlogPost } from "@/features/blog/components/blog-post";

// No static shell for this route, and so no Suspense boundary or skeleton.
// `generateStaticParams` prerenders every slug from local MDX at build time, so
// the whole page is static HTML — there is no dynamic hole to stream into and a
// skeleton would never be shown. Opting out is the documented choice when a
// route's content is fully known ahead of time.
export const instant = false;

export const generateStaticParams = (): { slug: string }[] =>
  getBlogPostSummaries().map(({ slug }) => ({ slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const summary = getBlogPostSummary(slug);

  if (!summary) {
    notFound();
  }

  return {
    description: summary.description,
    title: `${summary.title} — Pinbound`,
  };
};

const BlogPostPage = async ({ params }: PageProps<"/blog/[slug]">) => {
  const { slug } = await params;

  return (
    <Section className="pt-16 md:pt-16">
      <BlogPost slug={slug} />
    </Section>
  );
};

export default BlogPostPage;
