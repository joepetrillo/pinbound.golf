"use client";

import { RiMicLine, RiPlayCircleLine } from "@remixicon/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const sampleCalls = [
  {
    caption: "Same-day booking",
    duration: "0:42",
    heights: [
      4, 8, 12, 16, 10, 14, 7, 11, 15, 9, 13, 6, 10, 14, 8, 12, 5, 15, 11, 7,
    ],
    id: "same-day",
  },
  {
    caption: "Enforcing an online-only policy",
    duration: "1:08",
    heights: [
      6, 10, 8, 14, 12, 7, 15, 9, 11, 16, 5, 13, 10, 8, 14, 6, 12, 9, 15, 7,
    ],
    id: "policy",
  },
  {
    caption: "After-hours cancellation",
    duration: "0:55",
    heights: [
      5, 9, 13, 7, 15, 11, 8, 14, 10, 6, 16, 12, 9, 13, 7, 11, 15, 8, 10, 6,
    ],
    id: "after-hours",
  },
];

function Waveform({
  heights,
  active,
}: {
  heights: number[];
  active?: boolean;
}) {
  return (
    <div className="flex h-5 flex-1 items-center justify-center gap-px">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-0.5 rounded-full transition-colors",
            active ? "bg-emerald-600" : "bg-emerald-600/50"
          )}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function SampleCallCard({
  duration,
  caption,
  heights,
  playing,
  onToggle,
}: {
  duration: string;
  caption: string;
  heights: number[];
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50",
        playing && "border-emerald-600/30 bg-emerald-50/50"
      )}
    >
      <div className="flex items-center gap-3">
        <RiPlayCircleLine
          className={cn(
            "size-6 shrink-0 transition-colors",
            playing ? "text-emerald-700" : "text-muted-foreground"
          )}
        />
        <Waveform heights={heights} active={playing} />
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {duration}
        </span>
      </div>
      <p className="text-sm font-medium">{caption}</p>
    </button>
  );
}

export function LiveDemo() {
  const [listening, setListening] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section id="demo" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Don&apos;t take our word for it. Talk to it.
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          This is a real Pinbound agent running a sample course. Ask about tee
          times, try to book next week, ask for a person — see how it handles
          your toughest caller.
        </p>

        <div className="mt-12 rounded-2xl border bg-muted/50 p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {!listening && (
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
              <button
                type="button"
                aria-pressed={listening}
                aria-label={listening ? "Stop listening" : "Tap to talk"}
                onClick={() => setListening((prev) => !prev)}
                className={cn(
                  "relative flex size-24 flex-col items-center justify-center gap-1 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95",
                  listening && "ring-4 ring-emerald-600/30"
                )}
              >
                <RiMicLine className="size-8" />
                <span className="text-[9px] font-semibold tracking-widest uppercase">
                  {listening ? "Listening" : "Tap to talk"}
                </span>
              </button>
            </div>
            <h3 className="mt-6 text-lg font-bold">Talk to the demo agent</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Live voice conversation, right in your browser.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {sampleCalls.map((call) => (
              <SampleCallCard
                key={call.id}
                duration={call.duration}
                caption={call.caption}
                heights={call.heights}
                playing={playingId === call.id}
                onToggle={() =>
                  setPlayingId((prev) => (prev === call.id ? null : call.id))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
