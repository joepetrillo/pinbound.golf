import type { Metadata } from "next";

import { Section } from "@/components/section";
import { BlogIndex } from "@/features/blog/components/blog-index";

export const metadata: Metadata = {
  description:
    "Notes on building a calmer, more capable pro shop. Articles, tips, and insights for golf pros and their teams.",
  title: "Blog — Pinbound",
};

// No static shell for this route, and so no Suspense boundary or skeleton. The
// index reads local MDX through a cached query, so the page is static HTML end
// to end — there is no dynamic hole to stream into and a skeleton would never
// be shown.
export const instant = false;

const BlogPage = () => (
  <Section className="pt-16 md:pt-16">
    <header className="grid gap-6 md:grid-cols-[1fr_3fr] md:items-end">
      <h1 className="text-4xl font-medium tracking-tight text-balance md:text-6xl">
        Blog
      </h1>
      <p className="max-w-md leading-relaxed text-balance text-muted-foreground md:justify-self-end md:text-right">
        {metadata.description}
      </p>
    </header>

    <BlogIndex />
  </Section>
);

export default BlogPage;
