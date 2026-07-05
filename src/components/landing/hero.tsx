"use client";

import {
  RiRestartLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from "@remixicon/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCRIPT = [
  {
    speaker: "agent" as const,
    text: "Thanks for calling Pinehills — this is the virtual assistant. This call may be recorded. How can I help?",
  },
  {
    speaker: "caller" as const,
    text: "Any tee times tomorrow morning for two?",
  },
  {
    speaker: "agent" as const,
    text: "I have 7:40 and 8:10 on the Jones Course. Want me to hold one?",
  },
  {
    speaker: "caller" as const,
    text: "Grab the 7:40.",
  },
  {
    speaker: "agent" as const,
    text: "You're booked — 7:40 AM, Jones Course, two players. Confirmation is on its way.",
  },
];

const TICKER_ITEMS = [
  { text: "Answered 9:14 PM — booked 4 players", type: "check" as const },
  { text: "Answered 6:02 AM — cancellation processed", type: "check" as const },
  { text: "Transferred to staff — outing inquiry", type: "arrow" as const },
  { text: "Answered 8:47 PM — rates & dress code", type: "check" as const },
  {
    text: "Answered 12:30 PM — same-day booking, 2 players",
    type: "check" as const,
  },
];

const WORD_INTERVAL_MS = 150;
const LOOP_PAUSE_MS = 2500;

function KaraokeLine({
  text,
  spokenCount,
  isActive,
}: {
  text: string;
  spokenCount: number;
  isActive: boolean;
}) {
  const words = text.split(" ");

  return (
    <span>
      {words.map((word, i) => (
        <span key={i}>
          <span
            className={cn(
              "transition-opacity duration-150",
              !isActive || i < spokenCount ? "opacity-100" : "opacity-25"
            )}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

function TranscriptCard() {
  const [lineIndex, setLineIndex] = useState(0);
  const [spokenCount, setSpokenCount] = useState(0);
  const [muted, setMuted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const pauseRef = useRef(false);

  const reset = useCallback(() => {
    pauseRef.current = false;
    setLineIndex(0);
    setSpokenCount(0);
    setResetKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const currentLine = SCRIPT[lineIndex];
    if (!currentLine) {return;}

    const words = currentLine.text.split(" ");

    if (spokenCount >= words.length) {
      if (lineIndex >= SCRIPT.length - 1) {
        pauseRef.current = true;
        const timeout = setTimeout(() => {
          pauseRef.current = false;
          setLineIndex(0);
          setSpokenCount(0);
        }, LOOP_PAUSE_MS);
        return () => clearTimeout(timeout);
      }

      const timeout = setTimeout(() => {
        setLineIndex((i) => i + 1);
        setSpokenCount(0);
      }, 300);
      return () => clearTimeout(timeout);
    }

    if (pauseRef.current) {return;}

    const timeout = setTimeout(() => {
      setSpokenCount((c) => c + 1);
    }, WORD_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [lineIndex, spokenCount, resetKey]);

  const visibleLines = SCRIPT.slice(0, lineIndex + 1);

  return (
    <div className="flex min-h-[340px] flex-col rounded-xl border bg-muted/50 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
          </span>
          Incoming call · 9:12 PM
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            className="flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Restart transcript"
          >
            <RiRestartLine className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <RiVolumeMuteLine className="size-3.5" />
            ) : (
              <RiVolumeUpLine className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden">
        {visibleLines.map((line, i) => {
          const isAgent = line.speaker === "agent";
          const isActive = i === lineIndex;
          const words = line.text.split(" ");

          return (
            <div
              key={`${resetKey}-${i}`}
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                isAgent
                  ? "self-start border bg-background text-foreground"
                  : "self-end bg-emerald-100 text-foreground dark:bg-emerald-950/40"
              )}
            >
              <KaraokeLine
                text={line.text}
                spokenCount={isActive ? spokenCount : words.length}
                isActive={isActive}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="border-y py-3">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
      <div className="overflow-hidden">
        <div className="hero-marquee flex w-max items-center gap-8">
          {items.map((item, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap text-muted-foreground"
            >
              {item.type === "check" ? (
                <span className="text-emerald-600">✓</span>
              ) : (
                <span>→</span>
              )}
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-balance md:text-6xl">
              Answers every call. Knows your course. Follows your rules.
            </h1>
            <p className="mt-6 max-w-prose text-lg text-muted-foreground">
              Pinbound is your pro shop&apos;s AI phone agent — on the line
              24/7, trained on your rates, policies, and tee sheet, and handing
              off to your team the moment a caller needs a person. You control
              exactly what it&apos;s allowed to do.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button render={<Link href="#demo" />} size="lg">
                Hear It Answer a Call
              </Button>
              <Button
                render={<Link href="#pricing" />}
                variant="outline"
                size="lg"
              >
                Get a Free Pilot
              </Button>
            </div>
          </div>

          <TranscriptCard />
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <ActivityTicker />
      </div>
    </section>
  );
}
