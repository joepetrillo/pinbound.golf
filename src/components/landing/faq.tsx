"use client";

import { Section } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    answer:
      "Pinbound checks course rules and permissions before every tee-sheet action, then confirms only after the tee sheet reports success. Failed or uncertain requests go to your staff instead of becoming a guess.",
    id: "booking-wrong",
    question: "What if it books something wrong?",
  },
  {
    answer:
      'Yes. Saying "talk to a person" starts an immediate transfer, and recognized VIP numbers can bypass the assistant; if nobody answers, Pinbound creates a callback task with the call details.',
    id: "human-handoff",
    question: "Can callers still reach a person?",
  },
  {
    answer:
      "EZLinks is supported for availability, booking, lookup, changes, and cancellations. Additional tee sheets depend on course demand and the capabilities each vendor makes available.",
    id: "tee-sheet-support",
    question: "Which tee sheets do you support?",
  },
  {
    answer:
      "Pinbound never asks callers to speak card details. It sends the tee sheet's secure hosted checkout when available; otherwise, it transfers the caller or directs them to your existing booking flow.",
    id: "payments",
    question: "How are payments handled?",
  },
  {
    answer:
      "No. Every call opens by identifying Pinbound as an automated virtual assistant and gives the required recording notice. Callers can always try to reach a person by saying something like 'talk to a person'.",
    id: "pretend-human",
    question: "Does it pretend to be human?",
  },
  {
    answer:
      "Your authorized team controls course facts, temporary updates, tee-sheet permissions, handoff rules, coverage, voice, and greeting. Role-based access limits who can manage integrations, review calls, or update approved information.",
    id: "course-control",
    question: "What does the course control?",
  },
  {
    answer:
      "Automatic fallback routing keeps calls moving and alerts staff when Pinbound or a connection is unavailable. Pinbound never reports an unconfirmed tee-time action as complete.",
    id: "reliability",
    question: "What happens if Pinbound or the connection goes down?",
  },
];

export const Faq = () => (
  <Section id="faq">
    <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
      <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Fair questions, straight answers
      </h2>

      <Accordion>
        {faqItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-pretty text-muted-foreground">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </Section>
);
