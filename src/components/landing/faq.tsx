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
      "Pinbound never confirms a tee time until EZLinks returns a successful result. Deterministic policy and permission checks run before every write, and each action has an audit record. Failed or uncertain requests go to your staff instead of becoming a guess.",
    id: "booking-wrong",
    question: "What if it books something wrong?",
  },
  {
    answer:
      'Immediately. Saying "talk to a person" starts a transfer without an argument, and recognized VIP numbers can bypass the assistant. If nobody answers, Pinbound creates a callback task with the reason, details, requested time, and transcript.',
    id: "human-handoff",
    question: "Can callers still reach a person?",
  },
  {
    answer:
      "EZLinks is supported at launch for availability, booking, lookup, changes, and cancellations. Other tee sheets are added behind the same normalized adapter, prioritized by course demand and the capabilities each vendor makes available.",
    id: "tee-sheet-support",
    question: "Which tee sheets do you support?",
  },
  {
    answer:
      "Pinbound never asks a caller to speak card details. When EZLinks provides a secure hosted checkout and reservation hold, Pinbound texts that link and waits for verified payment before confirming. Otherwise it transfers the caller or sends them to your existing booking flow.",
    id: "payments",
    question: "How are payments handled?",
  },
  {
    answer:
      "No. Every call opens by identifying Pinbound as an AI or virtual assistant and giving the required recording notice.",
    id: "pretend-human",
    question: "Does it pretend to be human?",
  },
  {
    answer:
      "Your authorized team controls course facts, temporary updates, permitted tee-sheet actions, handoff rules, coverage, voice, and greeting. Owners manage billing and integrations; staff can review calls and update approved day-to-day information. A kill switch restores normal routing at any time.",
    id: "who-controls",
    question: "Who controls it?",
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
