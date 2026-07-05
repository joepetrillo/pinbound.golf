import { RiPhoneLine } from "@remixicon/react";

import { Section } from "@/components/section";

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
];

export const Problem = () => (
  <Section>
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-4">
        <p className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          Saturday morning: line at the counter, two staff checking in golfers,
          phone ringing out. That caller books somewhere else.
        </p>
        <p className="max-w-prose text-muted-foreground">
          Industry audits find about 81% of after-hours calls to golf courses go
          unanswered or hit voicemail.
        </p>
      </div>

      <div className="rounded-xl border bg-muted/50 p-4">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Missed calls
        </p>
        <ul className="flex flex-col gap-2">
          {missedCalls.map((call) => (
            <li
              className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3"
              key={call.id}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <RiPhoneLine
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
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
