import type { Metadata } from "next";

import { Section } from "@/components/section";
import { CONTACT_EMAIL } from "@/lib/site";

import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  description:
    "Contact Pinbound about product questions, tee-sheet integrations, partnerships, or support.",
  title: "Contact — Pinbound",
};

const ContactPage = () => (
  <Section className="pt-16 md:pt-20">
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <header>
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Contact us
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-pretty text-muted-foreground">
          Ask about Pinbound, a tee-sheet integration, a partnership, or an
          existing conversation. Send the form and your message goes straight to
          our team.
        </p>
        <p className="mt-4 hidden max-w-prose leading-relaxed text-muted-foreground lg:block">
          Prefer your own inbox? Email{" "}
          <a
            className="underline underline-offset-4"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </header>

      <div>
        <ContactForm />
        <p className="mt-8 max-w-prose leading-relaxed text-muted-foreground lg:hidden">
          Prefer your own inbox? Email{" "}
          <a
            className="underline underline-offset-4"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  </Section>
);

export default ContactPage;
