import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { CTA_HREF, CTA_LABEL } from "@/lib/site";

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
      Sign-up and onboarding are coming soon. In the meantime, claim a founding
      spot and we&apos;ll walk you through shadow-mode setup personally.
    </p>
    <div className="mt-8">
      <Link className={buttonVariants({ size: "lg" })} href={CTA_HREF}>
        {CTA_LABEL}
      </Link>
    </div>
  </Section>
);

export default GetStartedPage;
