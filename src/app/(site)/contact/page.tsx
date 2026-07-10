import type { Metadata } from "next";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { FOUNDERS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  description: "Get in touch with the Pinbound team.",
  title: "Contact — Pinbound",
};

const ContactPage = () => (
  <Section>
    <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
      Contact us
    </h1>
    <p className="mt-4 max-w-prose text-balance text-muted-foreground">
      Have a question about Pinbound, your tee sheet, or the founding program?
      Email us and we&apos;ll get back to you within a business day.
    </p>
    <div className="mt-8">
      <a
        aria-label={`Email ${FOUNDERS_EMAIL}`}
        className={buttonVariants({ size: "lg" })}
        href={`mailto:${FOUNDERS_EMAIL}`}
      >
        Email {FOUNDERS_EMAIL}
      </a>
    </div>
  </Section>
);

export default ContactPage;
