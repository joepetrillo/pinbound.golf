import { RiPhoneLine } from "@remixicon/react";

import { Section } from "@/components/section";
import { staggerStyle } from "@/features/landing/landing-stagger-style";

const missedCalls = [
  {
    id: "missed-1",
    number: "(555) 284-0193",
    time: "Sat 8:14 AM",
  },
  {
    id: "missed-2",
    number: "(555) 901-4472",
    time: "Sat 8:22 AM",
  },
  {
    id: "missed-3",
    number: "(555) 338-7721",
    time: "Sat 8:31 AM",
  },
  {
    id: "missed-4",
    number: "(555) 116-8305",
    time: "Sat 12:47 PM",
  },
];

export const Problem = () => (
  <Section id="product">
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="order-1 space-y-4 lg:order-2" data-reveal>
        <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
          The counter always wins. That&apos;s the problem.
        </h2>
        <p className="max-w-prose text-pretty text-muted-foreground">
          Every unanswered ring tells a golfer something about your course. The
          caller on a Saturday morning has a foursome ready and money to spend,
          and they picked you first. Voicemail sends them to the course down the
          road, and next weekend they won&apos;t even start with you.
        </p>
      </div>

      <div className="order-2 lg:order-1">
        <p
          className="mb-4 text-xs font-medium text-muted-foreground"
          data-reveal
        >
          What a Saturday looks like
        </p>
        {/* --i is each child's place in the stagger; see src/app/motion.css. */}
        <ul
          className="flex flex-col gap-3 mask-[linear-gradient(to_bottom,black_60%,transparent)]"
          data-reveal-group
        >
          {missedCalls.map((call, index) => (
            <li
              className="flex items-center gap-3 rounded-2xl border bg-background/80 px-4 py-3 shadow-sm backdrop-blur"
              key={call.id}
              style={staggerStyle(index)}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <RiPhoneLine
                  aria-hidden="true"
                  className="size-4 text-red-500/80"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  Missed call · {call.time}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {call.number}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Section>
);
