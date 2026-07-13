"use client";

import { RiResetLeftLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Section } from "@/components/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CTA_HREF, CTA_LABEL, DEMO_HREF, DEMO_LABEL } from "@/lib/site";
import { cn } from "@/lib/utils";

const WORD_INTERVAL_MS = 225;
const LINE_PAUSE_MS = 500;
const NEXT_CONVERSATION_PAUSE_MS = 2000;

interface ScriptWord {
  id: string;
  position: number;
  text: string;
}

interface ScriptLine {
  id: string;
  speaker: "agent" | "caller";
  text: string;
  words: ScriptWord[];
}

const makeLine = (
  id: string,
  speaker: ScriptLine["speaker"],
  text: string
): ScriptLine => ({
  id,
  speaker,
  text,
  words: text.split(" ").map((word, index) => ({
    id: `${id}-w${index + 1}`,
    position: index,
    text: word,
  })),
});

interface Conversation {
  id: string;
  label: string;
  lines: ScriptLine[];
}

const GREETING_ID = "agent-greeting";
const GREETING_TEXT =
  "Thanks for calling Pinehills. I'm the AI virtual assistant. This call is recorded. How can I help?";

const CONVERSATIONS: Conversation[] = [
  {
    id: "booking",
    label: "Booking",
    lines: [
      makeLine(GREETING_ID, "agent", GREETING_TEXT),
      makeLine(
        "caller-request",
        "caller",
        "Hey — do you have anything tomorrow morning for two?"
      ),
      makeLine(
        "agent-course",
        "agent",
        "Sure. Are you looking at the Jones Course, or the Nicklaus?"
      ),
      makeLine("caller-course", "caller", "Jones is fine."),
      makeLine(
        "agent-offer",
        "agent",
        "On Jones tomorrow I have 7:40 and 8:10, both walking. Want me to hold one?"
      ),
      makeLine("caller-confirm", "caller", "Yeah, grab the 7:40."),
      makeLine("agent-name", "agent", "What's the name for the booking?"),
      makeLine("caller-name", "caller", "Marcus Chen."),
      makeLine(
        "agent-booked",
        "agent",
        "You're all set — 7:40 AM, Jones Course, two players under Marcus Chen. I'll text a confirmation to this number."
      ),
    ],
  },
  {
    id: "cancellation",
    label: "Cancellation",
    lines: [
      makeLine(GREETING_ID, "agent", GREETING_TEXT),
      makeLine(
        "caller-request",
        "caller",
        "I need to cancel my tee time this afternoon."
      ),
      makeLine(
        "agent-lookup",
        "agent",
        "I can help with that. What's the confirmation number and last name on the booking?"
      ),
      makeLine("caller-name", "caller", "P8142, under Ortiz."),
      makeLine(
        "agent-policy",
        "agent",
        "Found it — 2:30 PM today, two players. Our policy asks for 24 hours' notice, so I can't cancel this one myself. Want me to transfer you to the shop?"
      ),
      makeLine("caller-confirm", "caller", "Yes, please."),
      makeLine(
        "agent-transfer",
        "agent",
        "Transferring you now — they'll have your booking pulled up when they pick up."
      ),
    ],
  },
  {
    id: "hours",
    label: "Hours & rates",
    lines: [
      makeLine(GREETING_ID, "agent", GREETING_TEXT),
      makeLine(
        "caller-hours",
        "caller",
        "What time do you open tomorrow? And can I still walk on?"
      ),
      makeLine(
        "agent-hours",
        "agent",
        "First tee time is 6:30 AM and the shop opens at 6. Walk-ons are welcome, but mornings usually book out — afternoons are your best bet."
      ),
      makeLine(
        "caller-rates",
        "caller",
        "Got it. What's the weekend rate for 18 with a cart?"
      ),
      makeLine(
        "agent-rates",
        "agent",
        "Weekends it's $68 for 18 with a cart, $49 walking. Twilight starts at 3 PM at $42."
      ),
      makeLine("caller-thanks", "caller", "Perfect, thanks."),
      makeLine(
        "agent-close",
        "agent",
        "Anytime — want me to text you a booking link before the morning fills up?"
      ),
    ],
  },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const getReducedMotionMedia = () => window.matchMedia(REDUCED_MOTION_QUERY);

const getReducedMotionServerSnapshot = () => false;

const getReducedMotionSnapshot = () => getReducedMotionMedia().matches;

const subscribeReducedMotion = (onStoreChange: () => void) => {
  const media = getReducedMotionMedia();
  media.addEventListener("change", onStoreChange);

  return () => {
    media.removeEventListener("change", onStoreChange);
  };
};

interface KaraokeLineProps {
  isActive: boolean;
  spokenCount: number;
  words: ScriptWord[];
}

// Each word keeps its own persistent span so the reveal only changes opacity
// and the text never reflows (no layout shift while the transcript animates).
const KaraokeLine = ({ isActive, spokenCount, words }: KaraokeLineProps) => (
  <span>
    {words.map((word) => (
      <span key={word.id}>
        <span
          className={cn(
            "transition-opacity duration-150",
            isActive && word.position >= spokenCount
              ? "opacity-60"
              : "opacity-100"
          )}
        >
          {word.text}
        </span>
        {word.position < words.length - 1 ? " " : null}
      </span>
    ))}
  </span>
);

interface ConversationTranscriptProps {
  isVisible: boolean;
  lines: ScriptLine[];
  onComplete: () => void;
  prefersReducedMotion: boolean;
}

const ConversationTranscript = ({
  isVisible,
  lines,
  onComplete,
  prefersReducedMotion,
}: ConversationTranscriptProps) => {
  // Start past the greeting so it appears fully spoken right away — switching
  // tabs shouldn't replay the same opening line every time.
  const [lineIndex, setLineIndex] = useState(() =>
    Math.min(1, lines.length - 1)
  );
  const [spokenCount, setSpokenCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const currentLine = lines[lineIndex];
    if (!currentLine) {
      return;
    }

    if (spokenCount >= currentLine.words.length) {
      if (lineIndex >= lines.length - 1) {
        if (!isVisible) {
          return;
        }
        const timeout = setTimeout(onComplete, NEXT_CONVERSATION_PAUSE_MS);
        return () => {
          clearTimeout(timeout);
        };
      }

      const timeout = setTimeout(() => {
        setLineIndex((index) => index + 1);
        setSpokenCount(0);
      }, LINE_PAUSE_MS);
      return () => {
        clearTimeout(timeout);
      };
    }

    if (!isVisible) {
      return;
    }

    const timeout = setTimeout(() => {
      setSpokenCount((count) => count + 1);
    }, WORD_INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    isVisible,
    lineIndex,
    lines,
    onComplete,
    prefersReducedMotion,
    spokenCount,
  ]);

  const visibleLines = prefersReducedMotion
    ? lines
    : lines.slice(0, lineIndex + 1);

  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport
          className="pointer-events-none scrollbar-gutter-auto overflow-y-hidden"
          tabIndex={-1}
        >
          <MessageScrollerContent className="min-h-full justify-end gap-3">
            {visibleLines.map((line) => {
              const isAgent = line.speaker === "agent";
              const isActive = prefersReducedMotion
                ? false
                : line.id === lines[lineIndex]?.id;
              const lineSpokenCount = isActive
                ? spokenCount
                : line.words.length;

              return (
                <MessageScrollerItem key={line.id}>
                  <Message align={isAgent ? "start" : "end"}>
                    <MessageContent>
                      <div
                        className={cn(
                          "w-fit max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-pretty",
                          isAgent
                            ? "border bg-background text-foreground"
                            : "bg-muted text-foreground"
                        )}
                        data-slot="message-bubble"
                      >
                        <KaraokeLine
                          isActive={isActive}
                          spokenCount={lineSpokenCount}
                          words={line.words}
                        />
                      </div>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              );
            })}
          </MessageScrollerContent>
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  );
};

const TranscriptCard = () => {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [isVisible, setIsVisible] = useState(true);
  const [activeId, setActiveId] = useState(CONVERSATIONS[0]?.id);
  const [restartNonce, setRestartNonce] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const conversation =
    CONVERSATIONS.find(({ id }) => id === activeId) ?? CONVERSATIONS[0];

  const advanceToNext = () => {
    setActiveId((currentId) => {
      const index = CONVERSATIONS.findIndex(({ id }) => id === currentId);
      return CONVERSATIONS[(index + 1) % CONVERSATIONS.length]?.id;
    });
  };

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

  if (!conversation) {
    return null;
  }

  return (
    <div
      className="flex h-96 flex-col rounded-4xl border bg-muted/50 p-4 shadow-sm"
      ref={cardRef}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <Tabs
          onValueChange={(value) => setActiveId(String(value))}
          value={conversation.id}
        >
          <TabsList className="h-8">
            {CONVERSATIONS.map(({ id, label }) => (
              <TabsTrigger className="px-2.5 text-xs" key={id} value={id}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {prefersReducedMotion ? null : (
          <Button
            aria-label="Restart transcript"
            onClick={() => setRestartNonce((nonce) => nonce + 1)}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <RiResetLeftLine aria-hidden />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          prefersReducedMotion
            ? null
            : "animate-in duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] fade-in"
        )}
        key={conversation.id}
      >
        <ConversationTranscript
          isVisible={isVisible}
          key={`${conversation.id}-${restartNonce}`}
          lines={conversation.lines}
          onComplete={advanceToNext}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </div>
  );
};

export const Hero = () => (
  <Section className="pt-14 md:pt-20" id="top">
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div>
        <h1 className="text-5xl font-medium tracking-tight text-balance md:text-6xl">
          The pro shop assistant that never clocks out
        </h1>
        <p className="mt-6 max-w-prose text-lg text-pretty text-muted-foreground">
          Pinbound is an AI phone agent that answers calls 24/7, books tee times
          directly into your tee sheet, and handles routine questions according
          to your course’s policies. Every caller gets the help they need, while
          your staff stays present with the golfers right in front of them.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link className={cn(buttonVariants({ size: "lg" }))} href={CTA_HREF}>
            {CTA_LABEL}
          </Link>
          <Link
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            href={DEMO_HREF}
          >
            {DEMO_LABEL}
          </Link>
        </div>
      </div>

      <TranscriptCard />
    </div>
  </Section>
);
