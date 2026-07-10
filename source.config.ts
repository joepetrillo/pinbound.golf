import { pageSchema } from "fumadocs-core/source/schema";
import { defineCollections, defineConfig } from "fumadocs-mdx/config";
import remarkGfm from "remark-gfm";
import { z } from "zod";

export const blogPosts = defineCollections({
  dir: "content/blog",
  schema: pageSchema.extend({
    description: z.string().min(1),
    // Example: "2026-07-10"
    publishedAt: z.iso.date(),
  }),
  type: "doc",
});

export default defineConfig({
  mdxOptions: {
    preset: "minimal",
    remarkPlugins: [remarkGfm],
  },
});
