"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqItems = [
  {
    value: "robot",
    question: "Does it sound like a robot?",
    answer:
      "Listen above. Natural voice, natural pacing — and it always discloses it\u2019s an assistant.",
  },
  {
    value: "wrong-booking",
    question: "What if it books something it shouldn\u2019t?",
    answer:
      "Your rules are enforced server-side and verified with test calls before go-live. It never confirms what the tee sheet didn\u2019t return.",
  },
  {
    value: "tee-sheet-down",
    question: "What if our tee sheet system goes down?",
    answer:
      "It says so honestly, takes a message, and offers a callback — it never guesses availability.",
  },
  {
    value: "recording-laws",
    question: "What about call recording laws?",
    answer:
      "Recording disclosure is built into the greeting and configured for your state\u2019s rules.",
  },
  {
    value: "control",
    question: "Can I control what it\u2019s allowed to do?",
    answer:
      "Completely. You choose when it answers (after-hours, overflow, or the full line), what it can book, and you can pause it or change any rule from your dashboard at any time.",
  },
  {
    value: "go-live",
    question: "How long does it take to go live?",
    answer:
      "Days, not months — and we start in shadow mode (after-hours only) so there\u2019s zero risk to your line.",
  },
  {
    value: "booking-cut",
    question: "Do you take a cut of bookings?",
    answer: "No. Flat monthly price. Your bookings are yours.",
  },
]

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
  )
}
