import type { Metadata } from "next";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { FOUNDERS_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description:
    "Contact Pinbound about product questions, tee-sheet integrations, partnerships, or an existing conversation.",
  title: "Contact — Pinbound",
};

const ContactPage = () => (
  <Section>
    <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
      Contact us
    </h1>
    <p className="mt-4 max-w-prose text-balance text-muted-foreground">
      Ask about Pinbound, a tee-sheet integration, a partnership, or an existing
      conversation. If you are ready to evaluate the product for your course,
      use Plan your pilot so your first email includes the details we need.
    </p>
    <div className="mt-8">
      <a
        aria-label={`Email ${FOUNDERS_EMAIL}`}
        className={cn(buttonVariants({ size: "lg" }))}
        href={`mailto:${FOUNDERS_EMAIL}`}
      >
        Email {FOUNDERS_EMAIL}
      </a>
    </div>
  </Section>
);

export default ContactPage;
