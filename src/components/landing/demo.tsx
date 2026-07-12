"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import { Section } from "@/components/section";
import {
  AudioPlayerButton,
  AudioPlayerDuration,
  AudioPlayerProvider,
  AudioPlayerTime,
  useAudioPlayer,
  useAudioPlayerTime,
} from "@/components/ui/audio-player";
import { LiveWaveform } from "@/components/ui/live-waveform";
import {
  ScrubBarContainer,
  ScrubBarProgress,
  ScrubBarTrack,
} from "@/components/ui/scrub-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioScrubber, Waveform } from "@/components/ui/waveform";
import { cn } from "@/lib/utils";

// The orb pulls in three.js — load it lazily on the client only.
const Orb = dynamic(
  async () => {
    const mod = await import("@/components/ui/orb");
    return mod.Orb;
  },
  {
    loading: () => <Skeleton className="size-full rounded-full" />,
    ssr: false,
  }
);

const ORB_COLORS: [string, string] = ["#a3c293", "#5f8050"];
const ROW_WAVEFORM_HEIGHT = 40;
const LIVE_WAVEFORM_HEIGHT = 48;

type MicStatus = "idle" | "listening" | "unavailable";

interface SampleCall {
  caption: string;
  durationLabel: string;
  durationSeconds: number;
  id: string;
  peaks: number[];
  src: string;
  transcript: string;
}

// Peaks are precomputed from the recordings in public/audio
const sampleCalls: SampleCall[] = [
  {
    caption: "Booking a tee time",
    durationLabel: "0:19",
    durationSeconds: 19.77,
    id: "booking",
    peaks: [
      0.521, 0.531, 0.459, 0.456, 0.397, 0.531, 0.558, 0.34, 0.719, 0.08, 0.464,
      0.784, 0.672, 0.767, 0.371, 0.975, 1, 0.723, 0.792, 0.907, 0.639, 0.495,
      0.684, 0.398, 0.888, 0.751, 0.867, 0.08, 0.548, 0.466, 0.496, 0.544,
      0.193, 0.08, 0.414, 0.783, 0.544, 0.688, 0.826, 0.876, 0.684, 0.708,
      0.452, 0.591, 0.679, 0.854, 0.705, 0.763,
    ],
    src: "/audio/sample-call-booking.m4a",
    transcript:
      "Caller: Any tee times tomorrow morning for two? Agent: I have 7:40 and 8:10 — want me to hold one?",
  },
  {
    caption: "Policy question",
    durationLabel: "0:16",
    durationSeconds: 16.78,
    id: "policy",
    peaks: [
      0.35, 0.357, 0.337, 0.581, 0.597, 0.528, 0.367, 0.432, 0.112, 0.08, 0.582,
      0.806, 0.808, 0.794, 0.816, 0.804, 0.862, 0.201, 0.772, 0.856, 0.792,
      0.823, 0.672, 0.524, 0.76, 0.736, 0.793, 0.603, 0.725, 0.614, 0.819,
      0.735, 0.758, 0.691, 0.762, 0.081, 0.416, 0.788, 0.479, 0.552, 0.435,
      0.08, 0.082, 1, 0.874, 0.781, 0.771, 0.656,
    ],
    src: "/audio/sample-call-policy.m4a",
    transcript:
      "Caller: Can I cancel tomorrow's 8:00 tee time? Agent: Cancellations need 24 hours' notice — that's inside the window, so I can't cancel it by phone. Want me to transfer you to the shop?",
  },
  {
    caption: "Human handoff",
    durationLabel: "0:07",
    durationSeconds: 7.49,
    id: "handoff",
    peaks: [
      0.348, 0.564, 0.419, 0.385, 0.466, 0.413, 0.38, 0.376, 0.51, 0.371, 0.344,
      0.345, 0.476, 0.646, 0.384, 0.419, 0.364, 0.13, 0.08, 0.08, 0.08, 0.08,
      0.202, 0.5, 0.63, 0.691, 0.288, 0.09, 0.561, 0.648, 0.695, 0.569, 0.646,
      0.652, 0.134, 0.08, 0.792, 1, 0.926, 0.702, 0.773, 0.792, 0.492, 0.756,
      0.62, 0.617, 0.777, 0.365,
    ],
    src: "/audio/sample-call-handoff.m4a",
    transcript:
      "Caller: I need to talk to someone about a league outing. Agent: I'll get the shop — one moment while I transfer you.",
  },
  {
    caption: "Hours & rates",
    durationLabel: "0:14",
    durationSeconds: 14.49,
    id: "hours",
    peaks: [
      0.517, 0.487, 0.721, 0.507, 0.511, 0.55, 0.249, 0.507, 0.566, 0.437,
      0.507, 0.107, 0.08, 0.08, 0.879, 0.782, 0.558, 0.778, 0.305, 0.706, 1,
      0.857, 0.955, 0.804, 0.537, 0.824, 0.916, 0.805, 0.54, 0.731, 0.457, 0.79,
      0.865, 0.783, 0.376, 0.85, 0.94, 0.684, 0.104, 0.256, 0.73, 0.259, 0.489,
      0.105, 0.092, 0.472, 0.132, 0.08,
    ],
    src: "/audio/sample-call-hours.m4a",
    transcript:
      "Caller: What time do you open tomorrow, and what's the weekday rate? Agent: We open at 6:30. Eighteen holes on a weekday is $52 with a cart, or $38 walking.",
  },
  {
    caption: "Weather & rain checks",
    durationLabel: "0:13",
    durationSeconds: 13.45,
    id: "weather",
    peaks: [
      0.362, 0.724, 0.542, 0.483, 0.612, 0.445, 0.294, 0.7, 0.532, 0.552, 0.457,
      0.277, 0.566, 0.543, 0.595, 0.496, 0.562, 0.479, 0.294, 0.089, 0.08, 0.08,
      0.67, 0.798, 0.771, 0.645, 0.165, 0.902, 0.938, 0.871, 0.602, 0.928,
      0.757, 0.781, 0.156, 0.617, 0.846, 0.89, 0.562, 0.259, 0.814, 0.858,
      0.812, 0.832, 1, 0.791, 0.732, 0.424,
    ],
    src: "/audio/sample-call-weather.m4a",
    transcript:
      "Caller: What happens to our 1:30 if it rains out? Agent: If the course closes, you get a rain check for the unplayed holes, good for 30 days.",
  },
];

interface SampleCallRowProps {
  call: SampleCall;
}

interface SampleCallScrubberProps extends SampleCallRowProps {
  onScrubbingPlayingChange: (playing: boolean) => void;
}

const SampleCallScrubber = ({
  call,
  onScrubbingPlayingChange,
}: SampleCallScrubberProps) => {
  const player = useAudioPlayer();
  const time = useAudioPlayerTime();
  const resumeAfterScrubRef = useRef(false);
  const duration =
    player.duration && Number.isFinite(player.duration)
      ? player.duration
      : call.durationSeconds;

  const handleScrubStart = () => {
    const wasPlaying = player.ref.current?.paused === false;
    resumeAfterScrubRef.current = wasPlaying;
    onScrubbingPlayingChange(wasPlaying);
    if (wasPlaying) {
      void player.pause();
    }
  };

  const handleScrubEnd = async () => {
    if (!resumeAfterScrubRef.current) {
      onScrubbingPlayingChange(false);
      return;
    }
    resumeAfterScrubRef.current = false;
    try {
      await player.play();
    } catch {
      // Playback can be rejected by the browser if it loses user activation.
    }
    requestAnimationFrame(() => onScrubbingPlayingChange(false));
  };

  return (
    <>
      <AudioScrubber
        barGap={1}
        barWidth={2}
        className="hidden h-10 w-full sm:block"
        currentTime={time}
        data={call.peaks}
        duration={duration}
        height={ROW_WAVEFORM_HEIGHT}
        onScrubEnd={handleScrubEnd}
        onScrubStart={handleScrubStart}
        onSeek={(seconds) => player.seek(seconds)}
        showHandle={false}
      />
      <ScrubBarContainer
        className="sm:hidden"
        duration={duration}
        onScrub={(seconds) => player.seek(seconds)}
        onScrubEnd={handleScrubEnd}
        onScrubStart={handleScrubStart}
        value={time}
      >
        <ScrubBarTrack aria-label={`Seek within ${call.caption}`}>
          <ScrubBarProgress />
        </ScrubBarTrack>
      </ScrubBarContainer>
      <div className="flex items-center justify-between">
        <AudioPlayerTime className="text-xs" />
        <AudioPlayerDuration
          className="text-xs"
          fallbackDuration={call.durationSeconds}
        />
      </div>
    </>
  );
};

const SampleCallRow = ({ call }: SampleCallRowProps) => {
  const player = useAudioPlayer();
  const active = player.isItemActive(call.id);
  const [isScrubbingWhilePlaying, setIsScrubbingWhilePlaying] = useState(false);

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-5 transition-colors",
        active && "bg-muted/50"
      )}
    >
      <AudioPlayerButton
        aria-label={`Play sample call: ${call.caption}`}
        className="mt-0.5 shrink-0 rounded-full"
        item={{ id: call.id, src: call.src }}
        size="icon-sm"
        variant={active ? "default" : "secondary"}
        visualPlaying={active && isScrubbingWhilePlaying ? true : undefined}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">{call.caption}</p>
          {active ? null : (
            <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
              {call.durationLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {call.transcript}
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {active ? (
            <SampleCallScrubber
              call={call}
              onScrubbingPlayingChange={setIsScrubbingWhilePlaying}
            />
          ) : (
            <Waveform
              barGap={1}
              barWidth={2}
              className="hidden h-10 w-full opacity-40 sm:block"
              data={call.peaks}
              height={ROW_WAVEFORM_HEIGHT}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface TalkWidgetProps {
  micStatus: MicStatus;
  onMicError: () => void;
  onToggle: () => void;
}

const TalkWidget = ({ micStatus, onMicError, onToggle }: TalkWidgetProps) => {
  if (micStatus === "unavailable") {
    return (
      <output className="block rounded-xl border border-dashed bg-muted/50 px-6 py-8 text-center">
        <p className="text-sm font-medium">
          Mic unavailable — listen to a recorded call instead
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Browser permissions blocked live voice. The sample calls show the same
          agent handling common calls.
        </p>
      </output>
    );
  }

  const listening = micStatus === "listening";

  return (
    <div className="flex flex-col items-center text-center">
      <button
        aria-label={listening ? "Stop listening" : "Tap to talk"}
        aria-pressed={listening}
        className={cn(
          "relative size-32 overflow-hidden rounded-full border bg-background shadow-lg transition-transform focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none active:scale-95",
          listening && "ring-4 ring-primary/30"
        )}
        onClick={onToggle}
        type="button"
      >
        <span className="pointer-events-none absolute inset-0" aria-hidden>
          <Orb
            agentState={listening ? "listening" : null}
            colors={ORB_COLORS}
          />
        </span>
      </button>

      <div className="mt-4 flex h-12 w-44 items-center justify-center">
        {listening ? (
          <LiveWaveform
            active
            barGap={2}
            barWidth={3}
            height={LIVE_WAVEFORM_HEIGHT}
            onError={onMicError}
          />
        ) : null}
      </div>

      <p className={cn("text-sm font-medium", listening && "shimmer")}>
        {listening ? "Listening" : "Try the demo agent"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {listening
          ? "Tap the orb to stop the demo."
          : "Uses your microphone. No recording is saved."}
      </p>
    </div>
  );
};

export const Demo = () => {
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");

  const handleToggle = () => {
    setMicStatus((status) => (status === "listening" ? "idle" : "listening"));
  };

  return (
    <Section id="demo">
      <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Hear it yourself
      </h2>
      <p className="mt-4 max-w-prose text-balance text-muted-foreground">
        Talk to the live demo agent in your browser, or play a simulated call to
        hear how Pinbound handles common pro-shop scenarios.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-start">
        <div className="flex items-center justify-center rounded-4xl border bg-muted/50 p-8 md:p-10 lg:sticky lg:top-24">
          <TalkWidget
            micStatus={micStatus}
            onMicError={() => setMicStatus("unavailable")}
            onToggle={handleToggle}
          />
        </div>

        <AudioPlayerProvider>
          <div
            className={cn(
              "flex flex-col divide-y overflow-hidden rounded-4xl border",
              micStatus === "unavailable" && "ring-2 ring-primary/20"
            )}
          >
            {sampleCalls.map((call) => (
              <SampleCallRow call={call} key={call.id} />
            ))}
          </div>
        </AudioPlayerProvider>
      </div>
    </Section>
  );
};
