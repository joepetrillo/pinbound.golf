"use client";

import { RiEditLine } from "@remixicon/react";
import { useState } from "react";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AutonomySegment {
  id: string;
  label: string;
}

interface CallLogEntry {
  caller: string;
  expanded?: boolean;
  id: string;
  outcome: string;
  time: string;
  transcript?: TranscriptLine[];
}

interface RuleRow {
  id: string;
  label: string;
  value: string;
}

interface TranscriptLine {
  id: string;
  role: "agent" | "caller";
  text: string;
}

interface VipEntry {
  id: string;
  name: string;
  number: string;
}

const autonomySegments: AutonomySegment[] = [
  { id: "after-hours", label: "After-hours only" },
  { id: "overflow", label: "+ Overflow" },
  { id: "full-line", label: "Full line" },
];

const callLog: CallLogEntry[] = [
  {
    caller: "(555) 224-8810",
    id: "call-1",
    outcome: "Booked 2 players 7:40 AM",
    time: "9:14 AM",
  },
  {
    caller: "(555) 901-4472",
    expanded: true,
    id: "call-2",
    outcome: "Transferred to front desk",
    time: "8:52 AM",
    transcript: [
      {
        id: "call-2-t1",
        role: "caller",
        text: "I need to change my tee time from Saturday.",
      },
      {
        id: "call-2-t2",
        role: "agent",
        text: "Let me check — I can move you to 10:20 on the South Course.",
      },
    ],
  },
  {
    caller: "(555) 338-7721",
    id: "call-3",
    outcome: "Answered — cart path policy",
    time: "8:31 AM",
  },
  {
    caller: "(555) 284-0193",
    id: "call-4",
    outcome: "Booked 4 players 2:10 PM",
    time: "7:48 AM",
  },
];

const rules: RuleRow[] = [
  { id: "rule-1", label: "Phone bookings", value: "Same-day only" },
  { id: "rule-2", label: "Cancellations", value: "24-hour notice" },
  { id: "rule-3", label: "Public rate", value: "$65 / Member: included" },
];

const vipList: VipEntry[] = [
  { id: "vip-1", name: "Robert Chen", number: "(555) 610-2284" },
  { id: "vip-2", name: "Diane Marsh", number: "(555) 447-9038" },
];

export const ControlRoom = () => {
  const [activeSegment, setActiveSegment] = useState(0);

  return (
    <Section id="how-it-works">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        You run it from the control room
      </h2>
      <p className="mt-4 max-w-prose text-muted-foreground">
        Every call logged with a transcript. Rules you can change while the
        shop&apos;s open. Pause the line, set today&apos;s status, or hand off
        when you want.
      </p>
      <p className="mt-2 max-w-prose text-muted-foreground">
        It starts on the easy shift and earns more. You decide when.
      </p>

      <Card className="mt-8 overflow-hidden rounded-xl shadow-sm ring-border">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="text-sm font-medium">Control room</span>
        </div>

        <div className="border-b bg-muted/20 p-4 md:p-5">
          <p className="text-sm font-medium">Autonomy</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Start after-hours. Add overflow at check-in rush. Take the full line
            when you&apos;re ready.
          </p>
          <fieldset className="mt-4 grid grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1">
            <legend className="sr-only">Agent autonomy level</legend>
            {autonomySegments.map((segment, index) => (
              <button
                key={segment.id}
                type="button"
                aria-pressed={activeSegment === index}
                onClick={() => setActiveSegment(index)}
                className={cn(
                  "rounded-md px-2 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm",
                  activeSegment === index
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {segment.label}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="grid md:grid-cols-5">
          <div className="md:col-span-3 md:border-r">
            <div className="border-b bg-muted/30 px-4 py-2">
              <p className="text-sm font-medium">Call log</p>
            </div>
            <div className="divide-y">
              {callLog.map((call) => (
                <div key={call.id}>
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3",
                      call.expanded && "bg-muted/20"
                    )}
                  >
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">
                      {call.time}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      {call.caller}
                    </span>
                    <Badge className="shrink-0" variant="secondary">
                      {call.outcome}
                    </Badge>
                  </div>
                  {call.expanded && call.transcript ? (
                    <div className="space-y-2 border-t bg-muted/10 px-4 py-3">
                      {call.transcript.map((line) => (
                        <p key={line.id} className="text-sm">
                          <span className="font-medium capitalize">
                            {line.role}:
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {line.text}
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-4 md:col-span-2">
            <div>
              <p className="mb-2 text-sm font-medium">Agent answering</p>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
                <span className="text-sm">Line active</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">On</span>
                  <div
                    className="relative h-5 w-9 rounded-full bg-primary"
                    aria-hidden
                  >
                    <span className="absolute top-0.5 right-0.5 size-4 rounded-full bg-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Rules</p>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start justify-between gap-2 rounded-md border border-dashed px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {rule.label}
                      </p>
                      <p className="text-sm">{rule.value}</p>
                    </div>
                    <RiEditLine
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Today&apos;s status</p>
              <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                Cart path only on 14–18 today
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                VIP — rings straight through
              </p>
              <div className="space-y-2">
                {vipList.map((vip) => (
                  <div
                    key={vip.id}
                    className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{vip.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {vip.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Section>
  );
};
