"use client";

import {
  RiMicLine,
  RiPlayCircleLine,
  RiStopCircleLine,
} from "@remixicon/react";
import { useRef, useState } from "react";

import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

interface MicStateListening {
  status: "listening";
}

interface MicStateIdle {
  status: "idle";
}

interface MicStateUnavailable {
  status: "unavailable";
}

type MicState = MicStateIdle | MicStateListening | MicStateUnavailable;

interface SampleCall {
  caption: string;
  duration: string;
  id: string;
  transcript: string;
  waveform: WaveformBar[];
}

interface WaveformBar {
  height: number;
  id: string;
}

interface WaveformProps {
  active?: boolean;
  bars: WaveformBar[];
}

interface SampleCallCardProps {
  call: SampleCall;
  emphasized?: boolean;
  playing: boolean;
  onToggle: () => void;
}

interface TalkWidgetProps {
  micState: MicState;
  onStart: () => void;
  onStop: () => void;
}

const makeWaveform = (prefix: string, heights: number[]): WaveformBar[] =>
  heights.map((height, index) => ({
    height,
    id: `${prefix}-w${String(index + 1).padStart(2, "0")}`,
  }));

const sampleCalls: SampleCall[] = [
  {
    caption: "Booking a tee time",
    duration: "0:38",
    id: "booking",
    transcript:
      "Caller: Any tee times tomorrow morning for two? Agent: I have 7:40 and 8:10 — want me to hold one?",
    waveform: makeWaveform(
      "booking",
      [4, 8, 12, 16, 10, 14, 7, 11, 15, 9, 13, 6, 10, 14, 8, 12, 5, 15, 11, 7]
    ),
  },
  {
    caption: "Policy question",
    duration: "0:52",
    id: "policy",
    transcript:
      "Caller: Can I cancel tomorrow's 8:00 tee time? Agent: Cancellations need 24 hours' notice — that one is inside the window, so I can't release it without a charge. Want me to transfer you to the shop?",
    waveform: makeWaveform(
      "policy",
      [6, 10, 8, 14, 12, 7, 15, 9, 11, 16, 5, 13, 10, 8, 14, 6, 12, 9, 15, 7]
    ),
  },
  {
    caption: "Human handoff",
    duration: "0:44",
    id: "handoff",
    transcript:
      "Caller: I need to talk to someone about a league outing. Agent: I'll get the shop — one moment while I transfer you.",
    waveform: makeWaveform(
      "handoff",
      [5, 9, 13, 7, 15, 11, 8, 14, 10, 6, 16, 12, 9, 13, 7, 11, 15, 8, 10, 6]
    ),
  },
];

const Waveform = ({ active, bars }: WaveformProps) => (
  <div
    aria-hidden="true"
    className="flex h-5 flex-1 items-center justify-center gap-px"
  >
    {bars.map((bar) => (
      <div
        key={bar.id}
        className={cn(
          "w-0.5 rounded-full transition-colors",
          active ? "bg-primary" : "bg-primary/40"
        )}
        style={{ height: `${bar.height}px` }}
      />
    ))}
  </div>
);

const SampleCallCard = ({
  call,
  emphasized = false,
  playing,
  onToggle,
}: SampleCallCardProps) => (
  <button
    type="button"
    aria-label={`${playing ? "Pause" : "Play"} sample call: ${call.caption}`}
    aria-pressed={playing}
    className={cn(
      "flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
      emphasized && "border-primary/40 bg-muted/60 ring-2 ring-primary/20",
      playing && "border-primary/30 bg-muted/50"
    )}
    onClick={onToggle}
  >
    <div className="flex items-center gap-3">
      <RiPlayCircleLine
        aria-hidden="true"
        className={cn(
          "size-6 shrink-0 transition-colors",
          playing ? "text-primary" : "text-muted-foreground"
        )}
      />
      <Waveform active={playing} bars={call.waveform} />
      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
        {call.duration}
      </span>
    </div>
    <div>
      <p className="text-sm font-medium">{call.caption}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {call.transcript}
      </p>
    </div>
  </button>
);

const TalkWidget = ({ micState, onStart, onStop }: TalkWidgetProps) => {
  if (micState.status === "unavailable") {
    return (
      <output className="block rounded-xl border border-dashed bg-muted/40 px-6 py-8 text-center">
        <p className="text-sm font-medium">
          Mic unavailable — listen to a recorded call instead
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Browser permissions blocked live voice. The sample calls below show
          the same agent handling common calls.
        </p>
      </output>
    );
  }

  const listening = micState.status === "listening";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {!listening && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-ping"
          />
        )}
        <button
          type="button"
          aria-label={listening ? "Stop listening" : "Tap to talk"}
          aria-pressed={listening}
          className={cn(
            "relative flex size-24 flex-col items-center justify-center gap-1 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-95",
            listening && "ring-4 ring-primary/30"
          )}
          onClick={listening ? onStop : onStart}
        >
          {listening ? (
            <RiStopCircleLine aria-hidden="true" className="size-8" />
          ) : (
            <RiMicLine aria-hidden="true" className="size-8" />
          )}
          <span className="text-[9px] font-semibold tracking-widest uppercase">
            {listening ? "Listening" : "Tap to talk"}
          </span>
        </button>
      </div>
      <p className="mt-6 text-sm font-medium">
        {listening
          ? "Speak now — tap stop when finished"
          : "Talk to the demo agent"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {listening
          ? "Live wireframe — no backend connected yet."
          : "Uses your mic in the browser. No recording is saved."}
      </p>
    </div>
  );
};

export const Demo = () => {
  const [micState, setMicState] = useState<MicState>({ status: "idle" });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const releaseStream = () => {
    const tracks = streamRef.current?.getTracks() ?? [];
    for (const track of tracks) {
      track.stop();
    }
    streamRef.current = null;
  };

  const handleStart = async () => {
    if (micState.status === "unavailable") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      releaseStream();
      setMicState({ status: "unavailable" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicState({ status: "listening" });
    } catch {
      releaseStream();
      setMicState({ status: "unavailable" });
    }
  };

  const handleStop = () => {
    releaseStream();
    setMicState({ status: "idle" });
  };

  const micUnavailable = micState.status === "unavailable";

  return (
    <Section id="demo">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        Hear it yourself
      </h2>
      <p className="mt-4 max-w-prose text-muted-foreground">
        Tap the mic to try it live, or play a sample call from a real pro shop
        scenario.
      </p>

      <div className="mt-10 rounded-2xl border bg-muted/50 p-8 md:p-10">
        <TalkWidget
          micState={micState}
          onStart={handleStart}
          onStop={handleStop}
        />

        <div
          className={cn(
            "mt-10 grid gap-4 md:grid-cols-3",
            micUnavailable && "md:gap-5"
          )}
        >
          {sampleCalls.map((call) => (
            <SampleCallCard
              key={call.id}
              call={call}
              emphasized={micUnavailable}
              playing={playingId === call.id}
              onToggle={() =>
                setPlayingId((prev) => (prev === call.id ? null : call.id))
              }
            />
          ))}
        </div>
      </div>
    </Section>
  );
};
