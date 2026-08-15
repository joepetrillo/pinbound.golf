import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/section";
import {
  getBlogPostSummaries,
  getBlogPostSummary,
} from "@/features/blog/blog-queries";
import { BlogPost } from "@/features/blog/components/blog-post";

// Published slugs are prerendered from local MDX. Unlisted slugs only resolve
// far enough to reach notFound(), so blocking is intentional and a loading
// skeleton would misrepresent the only possible outcome.
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
