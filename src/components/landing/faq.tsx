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
      "It never confirms a time the tee sheet didn't return. And it starts in shadow mode, so you see every call before it touches your main line.",
    id: "booking-wrong",
    question: "What if it books something wrong?",
  },
  {
    answer:
      'Instantly, always. Saying "talk to a person" transfers immediately, and VIP numbers ring straight through.',
    id: "human-handoff",
    question: "Can callers still reach a person?",
  },
  {
    answer:
      "EZLinks and the GolfNow family are live today. Every other platform is prioritized by founding-course demand — tell us yours.",
    id: "tee-sheet-support",
    question: "Which tee sheets do you support?",
  },
  {
    answer:
      "Hibernate or annual options so you're not paying for a quiet shoulder season.",
    id: "off-season",
    question: "What about the off-season?",
  },
  {
    answer: "No. It answers as your course's virtual assistant, every time.",
    id: "pretend-human",
    question: "Does it pretend to be human?",
  },
  {
    answer:
      "You do — pause it, add details, modify rules, and monitor everything from the dashboard.",
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
