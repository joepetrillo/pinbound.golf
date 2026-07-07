import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  description: "Get in touch with the Pinbound team.",
  title: "Contact — Pinbound",
};

const ContactPage = () => (
  <Section>
    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
      Contact us
    </h1>
    <p className="mt-4 max-w-prose text-muted-foreground">
      Have a question about Pinbound, your tee sheet, or the founding program?
      Email us and we&apos;ll get back to you within a business day.
    </p>
    <div className="mt-8">
      <Button
        nativeButton={false}
        render={
          <a
            aria-label="Email founders@pinbound.golf"
            href="mailto:founders@pinbound.golf"
          />
        }
        size="lg"
      >
        Email founders@pinbound.golf
      </Button>
    </div>
    <p className="mt-6 text-sm text-muted-foreground">
      Or head back to the{" "}
      <Link className="underline underline-offset-4" href="/">
        homepage
      </Link>
      .
    </p>
  </Section>
);

export default ContactPage;
