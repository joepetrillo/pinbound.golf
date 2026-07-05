"use client";

import {
  RiEditLine,
  RiFlagLine,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiPlayLine,
  RiStarLine,
  RiSunLine,
} from "@remixicon/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const recentCalls = [
  {
    label: "4 players — Jones Course",
    outcome: "Booked",
    outcomeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    time: "9:14 PM",
  },
  {
    label: "Rates & dress code",
    outcome: "Answered",
    outcomeClass: "bg-blue-50 text-blue-700 ring-blue-200",
    time: "8:52 PM",
  },
  {
    label: "Outing inquiry → staff",
    outcome: "Transferred",
    outcomeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    time: "7:31 PM",
  },
  {
    label: "2 players — North 9",
    outcome: "Booked",
    outcomeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    time: "6:08 PM",
  },
  {
    label: "Cancellation processed",
    outcome: "Answered",
    outcomeClass: "bg-muted text-muted-foreground ring-border",
    time: "5:45 PM",
  },
];

const weekStats = [
  { label: "After-hours answered", value: "41" },
  { label: "Resolution rate", value: "87%" },
  { label: "Bookings", value: "23" },
  { label: "Staff minutes saved", value: "312" },
];

const autonomySegments = ["After-hours", "+ Overflow", "Full line"] as const;

const controlBadges = [
  { icon: RiPauseCircleLine, label: "Pause agent anytime" },
  { icon: RiEditLine, label: "Edit rules live" },
  {
    icon: RiSunLine,
    label: "Today's status (frost delay, cart path only)",
  },
  { icon: RiStarLine, label: "VIP list" },
  { icon: RiPlayCircleLine, label: "Listen to any call" },
  { icon: RiFlagLine, label: "Flag & review" },
];

export function ControlRoom() {
  const [activeSegment, setActiveSegment] = useState(0);

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          Control Room
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Your phone line&apos;s control room.
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          Every call logged, recorded, and transcribed — listen to any of them,
          anytime. Pause the agent with one tap, update today&apos;s course
          status, and dial its responsibility up or down. You&apos;re always in
          charge; Pinbound just does the work.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {/* Recent calls panel */}
          <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="border-b bg-muted/40 px-4 py-2.5">
              <p className="text-sm font-medium">Recent calls</p>
            </div>
            <div className="divide-y">
              {recentCalls.map((call) => (
                <div
                  key={`${call.time}-${call.label}`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="w-14 shrink-0 text-xs text-muted-foreground">
                    {call.time}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                      call.outcomeClass
                    )}
                  >
                    {call.outcome}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {call.label}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Play call"
                    >
                      <RiPlayLine className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Flag call"
                    >
                      <RiFlagLine className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* This week ROI panel */}
          <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="border-b bg-muted/40 px-4 py-2.5">
              <p className="text-sm font-medium">This week</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {weekStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-muted/50 px-3 py-3"
                  >
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <svg
                viewBox="0 0 200 40"
                className="mt-4 h-10 w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600"
                  points="0,32 30,28 60,24 90,18 120,14 150,10 180,6 200,4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* You set the dial */}
        <Card className="mt-5 rounded-xl shadow-sm ring-border">
          <CardContent className="p-6">
            <h3 className="font-semibold">You set the dial</h3>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Start with after-hours only. Add overflow when the shop&apos;s
              slammed. Hand it the whole line when you&apos;re ready. Pinbound
              earns responsibility on your schedule — and you can dial it back
              anytime.
            </p>

            <div className="mt-5 inline-flex rounded-full border bg-muted/40 p-1">
              {autonomySegments.map((segment, index) => (
                <button
                  key={segment}
                  type="button"
                  onClick={() => setActiveSegment(index)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    activeSegment === index
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {segment}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-2">
          {controlBadges.map(({ icon: Icon, label }) => (
            <Badge
              key={label}
              variant="outline"
              className="rounded-full px-3 py-1.5 text-sm"
            >
              <Icon className="size-3.5" />
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
