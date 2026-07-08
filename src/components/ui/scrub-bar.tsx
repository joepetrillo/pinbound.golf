"use client";

// Adapted from ElevenLabs UI (https://ui.elevenlabs.io) — the Progress
// registry dependency is replaced with a plain width-driven fill so the
// component stays primitive-free.

import {
  createContext,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useContext,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

const SECONDS_PER_MINUTE = 60;
const PERCENT = 100;

function formatTimestamp(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }
  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface ScrubBarContextValue {
  duration: number;
  onScrub?: (time: number) => void;
  onScrubEnd?: () => void;
  onScrubStart?: () => void;
  progress: number;
  value: number;
}

const ScrubBarContext = createContext<ScrubBarContextValue | null>(null);

function useScrubBarContext() {
  const context = useContext(ScrubBarContext);
  if (!context) {
    throw new Error(
      "useScrubBarContext must be used within a ScrubBarContainer"
    );
  }
  return context;
}

interface ScrubBarContainerProps extends HTMLAttributes<HTMLDivElement> {
  duration: number;
  onScrub?: (time: number) => void;
  onScrubEnd?: () => void;
  onScrubStart?: () => void;
  value: number;
}

function ScrubBarContainer({
  duration,
  value,
  onScrub,
  onScrubStart,
  onScrubEnd,
  children,
  className,
  ...props
}: ScrubBarContainerProps) {
  const progress = duration > 0 ? (value / duration) * PERCENT : 0;

  const contextValue: ScrubBarContextValue = {
    duration,
    onScrub,
    onScrubEnd,
    onScrubStart,
    progress,
    value,
  };

  return (
    <ScrubBarContext.Provider value={contextValue}>
      <div
        className={cn("flex w-full items-center", className)}
        data-slot="scrub-bar-root"
        {...props}
      >
        {children}
      </div>
    </ScrubBarContext.Provider>
  );
}

type ScrubBarTrackProps = HTMLAttributes<HTMLDivElement>;

function ScrubBarTrack({ className, children, ...props }: ScrubBarTrackProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { duration, onScrub, onScrubStart, onScrubEnd, value } =
    useScrubBarContext();

  const getTimeFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!(track && duration)) {
        return null;
      }
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const clamped = Math.min(Math.max(ratio, 0), 1);
      return duration * clamped;
    },
    [duration]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!duration) {
        return;
      }
      event.preventDefault();
      onScrubStart?.();
      const time = getTimeFromClientX(event.clientX);
      if (time != null) {
        onScrub?.(time);
      }

      const handleMove = (moveEvent: PointerEvent) => {
        const nextTime = getTimeFromClientX(moveEvent.clientX);
        if (nextTime != null) {
          onScrub?.(nextTime);
        }
      };

      const handleUp = () => {
        onScrubEnd?.();
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp, { once: true });
    },
    [duration, getTimeFromClientX, onScrub, onScrubEnd, onScrubStart]
  );

  const clampedValue = Math.min(Math.max(value, 0), duration || 0);

  return (
    <div
      aria-valuemax={duration || 0}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      className={cn(
        "relative h-2 w-full grow cursor-pointer touch-none rounded-full bg-muted transition-none select-none",
        className
      )}
      data-slot="scrub-bar-track"
      onPointerDown={handlePointerDown}
      ref={trackRef}
      role="slider"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

type ScrubBarProgressProps = HTMLAttributes<HTMLDivElement>;

function ScrubBarProgress({ className, ...props }: ScrubBarProgressProps) {
  const { progress } = useScrubBarContext();

  return (
    <div
      className={cn(
        "absolute inset-y-0 left-0 rounded-full bg-primary",
        className
      )}
      data-slot="scrub-bar-progress"
      style={{ width: `${progress}%` }}
      {...props}
    />
  );
}

type ScrubBarThumbProps = HTMLAttributes<HTMLDivElement>;

function ScrubBarThumb({ className, children, ...props }: ScrubBarThumbProps) {
  const { progress } = useScrubBarContext();
  return (
    <div
      className={cn(
        "absolute top-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-colors",
        className
      )}
      data-slot="scrub-bar-thumb"
      style={{ left: `${progress}%` }}
      {...props}
    >
      {children}
    </div>
  );
}

interface ScrubBarTimeLabelProps extends HTMLAttributes<HTMLSpanElement> {
  format?: (time: number) => string;
  time: number;
}

function ScrubBarTimeLabel({
  className,
  time,
  format = formatTimestamp,
  ...props
}: ScrubBarTimeLabelProps) {
  return (
    <span
      data-slot="scrub-bar-time-label"
      {...props}
      className={cn("tabular-nums", className)}
    >
      {format(time)}
    </span>
  );
}

export {
  ScrubBarContainer,
  ScrubBarProgress,
  ScrubBarThumb,
  ScrubBarTimeLabel,
  ScrubBarTrack,
};
