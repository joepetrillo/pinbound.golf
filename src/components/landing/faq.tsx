"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    answer:
      "Listen above. Natural voice, natural pacing — and it always discloses it\u2019s an assistant.",
    question: "Does it sound like a robot?",
    value: "robot",
  },
  {
    answer:
      "Your rules are enforced server-side and verified with test calls before go-live. It never confirms what the tee sheet didn\u2019t return.",
    question: "What if it books something it shouldn\u2019t?",
    value: "wrong-booking",
  },
  {
    answer:
      "It says so honestly, takes a message, and offers a callback — it never guesses availability.",
    question: "What if our tee sheet system goes down?",
    value: "tee-sheet-down",
  },
  {
    answer:
      "Recording disclosure is built into the greeting and configured for your state\u2019s rules.",
    question: "What about call recording laws?",
    value: "recording-laws",
  },
  {
    answer:
      "Completely. You choose when it answers (after-hours, overflow, or the full line), what it can book, and you can pause it or change any rule from your dashboard at any time.",
    question: "Can I control what it\u2019s allowed to do?",
    value: "control",
  },
  {
    answer:
      "Days, not months — and we start in shadow mode (after-hours only) so there\u2019s zero risk to your line.",
    question: "How long does it take to go live?",
    value: "go-live",
  },
  {
    answer: "No. Flat monthly price. Your bookings are yours.",
    question: "Do you take a cut of bookings?",
    value: "booking-cut",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Questions GMs actually ask.
        </h2>

        <Accordion className="mt-10 max-w-3xl">
          {faqItems.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className="text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
