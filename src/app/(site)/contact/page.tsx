import type { Metadata } from "next";

import { Section } from "@/components/section";
import { ContactForm } from "@/features/contact/components/contact-form";

export const metadata: Metadata = {
  description:
    "Contact Pinbound about product questions, tee-sheet integrations, partnerships, or support.",
  title: "Contact — Pinbound",
};

const ContactPage = () => (
  <Section className="pt-16 md:pt-16">
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <header>
        <h1 className="text-4xl font-medium tracking-tight text-balance md:text-6xl">
          Contact Us
        </h1>
        <p className="mt-6 max-w-prose leading-relaxed text-pretty text-muted-foreground">
          Ask about Pinbound, a tee-sheet integration, a partnership, or an
          existing conversation. Send the form and your message goes straight to
          our team.
        </p>
      </header>

      <ContactForm />
    </div>
  </Section>
);

export default ContactPage;
