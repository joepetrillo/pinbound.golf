import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const BlogPostNotFound = () => (
  <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-8 px-6 text-center">
    <div className="space-y-4">
      <h1 className="text-5xl font-medium tracking-tight">Post not found</h1>
      <p className="text-muted-foreground">
        The blog post you are looking for does not exist.
      </p>
    </div>
    <Link className={buttonVariants()} href="/blog">
      Back to blog
    </Link>
  </section>
);

export default BlogPostNotFound;
