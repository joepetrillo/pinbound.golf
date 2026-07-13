import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { FOUNDERS_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description: "Start onboarding your course with Pinbound.",
  title: "Get started — Pinbound",
};

const GetStartedPage = () => (
  <Section>
    <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
      Get started
    </h1>
    <p className="mt-4 max-w-prose text-balance text-muted-foreground">
      Create your workspace, add your course, and walk through onboarding at
      your own pace. Founding spots include a free pilot and hands-on help from
      the founders.
    </p>
    <div className="mt-8">
      <Link
        className={cn(buttonVariants({ size: "lg" }))}
        href={`mailto:${FOUNDERS_EMAIL}`}
      >
        Email the founders
      </Link>
    </div>
  </Section>
);

export default GetStartedPage;
