"use client";

import { RiRestartLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { CTA_HREF, CTA_LABEL, DEMO_HREF, DEMO_LABEL } from "@/lib/site";
import { cn } from "@/lib/utils";

const LOOP_PAUSE_MS = 2500;
const TRANSCRIPT_MIN_HEIGHT = 360;
const WORD_INTERVAL_MS = 150;

const SCRIPT = [
  {
    id: "agent-greeting",
    speaker: "agent" as const,
    text: "Thanks for calling Pinehills — this is the virtual assistant. This call may be recorded. How can I help?",
  },
  {
    id: "caller-request",
    speaker: "caller" as const,
    text: "Any tee times tomorrow morning for two?",
  },
  {
    id: "agent-offer",
    speaker: "agent" as const,
    text: "I have 7:40 and 8:10 on the Jones Course. Want me to hold one?",
  },
  {
    id: "caller-confirm",
    speaker: "caller" as const,
    text: "Grab the 7:40.",
  },
  {
    id: "agent-booked",
    speaker: "agent" as const,
    text: "You're booked — 7:40 AM, Jones Course, two players. Confirmation is on its way.",
  },
];

interface KaraokeLineProps {
  isActive: boolean;
  spokenCount: number;
  text: string;
}

const KaraokeLine = ({ isActive, spokenCount, text }: KaraokeLineProps) => {
  const words = text.split(" ");
  const spoken = words.slice(0, spokenCount).join(" ");
  const remaining = words.slice(spokenCount).join(" ");

  return (
    <span>
      <span className="opacity-100">{spoken}</span>
      {remaining.length > 0 ? (
        <>
          {spoken.length > 0 ? " " : ""}
          <span
            className={cn(
              "transition-opacity duration-150",
              isActive ? "opacity-25" : "opacity-100"
            )}
          >
            {remaining}
          </span>
        </>
      ) : null}
    </span>
  );
};

const TranscriptCard = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [resetKey, setResetKey] = useState(0);
  const [spokenCount, setSpokenCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  const reset = () => {
    pauseRef.current = false;
    setLineIndex(0);
    setSpokenCount(0);
    setResetKey((key) => key + 1);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setPrefersReducedMotion(media.matches);
    };

    media.addEventListener("change", updateMotionPreference);

    return () => {
      media.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const currentLine = SCRIPT[lineIndex];
    if (!currentLine) {
      return;
    }

    const words = currentLine.text.split(" ");

    if (spokenCount >= words.length) {
      if (lineIndex >= SCRIPT.length - 1) {
        pauseRef.current = true;
        const timeout = setTimeout(() => {
          pauseRef.current = false;
          setLineIndex(0);
          setSpokenCount(0);
        }, LOOP_PAUSE_MS);
        return () => {
          clearTimeout(timeout);
        };
      }

      const timeout = setTimeout(() => {
        setLineIndex((index) => index + 1);
        setSpokenCount(0);
      }, 300);
      return () => {
        clearTimeout(timeout);
      };
    }

    if (pauseRef.current || !isVisible) {
      return;
    }

    const timeout = setTimeout(() => {
      setSpokenCount((count) => count + 1);
    }, WORD_INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [isVisible, lineIndex, prefersReducedMotion, resetKey, spokenCount]);

  const visibleLines = prefersReducedMotion
    ? SCRIPT
    : SCRIPT.slice(0, lineIndex + 1);

  return (
    <div
      className="flex flex-col rounded-xl border bg-muted/50 p-4 shadow-sm"
      ref={cardRef}
      style={{ minHeight: TRANSCRIPT_MIN_HEIGHT }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Incoming call · 9:12 AM
        </div>
        {prefersReducedMotion ? null : (
          <button
            aria-label="Restart transcript"
            className="flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground"
            onClick={reset}
            type="button"
          >
            <RiRestartLine className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden">
        {visibleLines.map((line) => {
          const isAgent = line.speaker === "agent";
          const isActive = prefersReducedMotion
            ? false
            : line.id === SCRIPT[lineIndex]?.id;
          const words = line.text.split(" ");
          const lineSpokenCount = isActive ? spokenCount : words.length;

          return (
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                isAgent
                  ? "self-start border bg-background text-foreground"
                  : "self-end bg-muted text-foreground"
              )}
              key={line.id}
            >
              <KaraokeLine
                isActive={isActive}
                spokenCount={lineSpokenCount}
                text={line.text}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Hero = () => (
  <Section className="pt-14 md:pt-20">
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight text-balance md:text-6xl">
          Every call answered. Every rule followed.
        </h1>
        <p className="mt-6 max-w-prose text-lg text-muted-foreground">
          Pinbound answers your pro shop phone, books what you allow by phone,
          enforces your policies, and hands humans the calls that need humans.
          And it never closes.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button render={<Link href={CTA_HREF} />} size="lg">
            {CTA_LABEL}
          </Button>
          <Button
            render={<Link href={DEMO_HREF} />}
            size="lg"
            variant="outline"
          >
            {DEMO_LABEL}
          </Button>
        </div>
      </div>

      <TranscriptCard />
    </div>
  </Section>
);
