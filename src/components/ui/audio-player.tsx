"use client";

// Adapted from ElevenLabs UI (https://ui.elevenlabs.io) — radix slider and
// dropdown speed menu removed; button/icons swapped for this project's
// Base UI button and Remix Icon set.

import { RiPauseFill, RiPlayFill } from "@remixicon/react";
import {
  type ComponentProps,
  createContext,
  type HTMLProps,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HAVE_FUTURE_DATA = 3;
const NETWORK_LOADING = 2;
const SECONDS_PER_MINUTE = 60;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / SECONDS_PER_MINUTE);
  const secs = Math.floor(seconds % SECONDS_PER_MINUTE);
  return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
}

export interface AudioPlayerItem<TData = unknown> {
  data?: TData;
  id: string | number;
  src: string;
}

interface AudioPlayerApi<TData = unknown> {
  activeItem: AudioPlayerItem<TData> | null;
  duration: number | undefined;
  error: MediaError | null;
  isBuffering: boolean;
  isItemActive: (id: string | number | null) => boolean;
  isPlaying: boolean;
  pause: () => void;
  play: (item?: AudioPlayerItem<TData> | null) => Promise<void>;
  ref: RefObject<HTMLAudioElement | null>;
  seek: (time: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerApi<unknown> | null>(null);

export function useAudioPlayer<TData = unknown>(): AudioPlayerApi<TData> {
  const api = useContext(AudioPlayerContext) as AudioPlayerApi<TData> | null;
  if (!api) {
    throw new Error(
      "useAudioPlayer cannot be called outside of AudioPlayerProvider"
    );
  }
  return api;
}

const AudioPlayerTimeContext = createContext<number | null>(null);

export const useAudioPlayerTime = () => {
  const time = useContext(AudioPlayerTimeContext);
  if (time === null) {
    throw new Error(
      "useAudioPlayerTime cannot be called outside of AudioPlayerProvider"
    );
  }
  return time;
};

type FrameCallback = () => void;

function useAnimationFrame(callback: FrameCallback) {
  const requestRef = useRef<number | null>(null);
  const callbackRef = useRef<FrameCallback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = () => {
      callbackRef.current();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
}

export function AudioPlayerProvider<TData = unknown>({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const itemRef = useRef<AudioPlayerItem<TData> | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [readyState, setReadyState] = useState(0);
  const [networkState, setNetworkState] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [error, setError] = useState<MediaError | null>(null);
  const [activeItem, setActiveItemState] =
    useState<AudioPlayerItem<TData> | null>(null);
  const [paused, setPaused] = useState(true);

  const awaitPendingPlay = useCallback(async () => {
    if (!playPromiseRef.current) {
      return;
    }
    try {
      await playPromiseRef.current;
    } catch {
      // An interrupted play() rejects with AbortError; safe to ignore.
    }
  }, []);

  const loadItem = useCallback((item: AudioPlayerItem<TData> | null) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    itemRef.current = item;
    if (!audio.paused) {
      audio.pause();
    }
    audio.currentTime = 0;
    if (item === null) {
      audio.removeAttribute("src");
    } else {
      audio.src = item.src;
    }
    audio.load();
  }, []);

  const play = useCallback(
    async (item?: AudioPlayerItem<TData> | null) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      await awaitPendingPlay();

      if (item !== undefined && item?.id !== itemRef.current?.id) {
        loadItem(item);
      }

      const playPromise = audio.play();
      playPromiseRef.current = playPromise;
      return playPromise;
    },
    [awaitPendingPlay, loadItem]
  );

  const pause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    await awaitPendingPlay();
    audio.pause();
    playPromiseRef.current = null;
  }, [awaitPendingPlay]);

  const seek = useCallback((nextTime: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = nextTime;
  }, []);

  const isItemActive = useCallback(
    (id: string | number | null) => activeItem?.id === id,
    [activeItem]
  );

  useAnimationFrame(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    setActiveItemState(itemRef.current);
    setReadyState(audio.readyState);
    setNetworkState(audio.networkState);
    setTime(audio.currentTime);
    setDuration(audio.duration);
    setPaused(audio.paused);
    setError(audio.error);
  });

  // Soft navigations hide this provider via Activity (or remount it). Pause
  // and clear the source so the browser doesn't keep playing detached audio,
  // and wipe React state so the play button doesn't flash as active on return.
  useLayoutEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      playPromiseRef.current = null;
      itemRef.current = null;
      setActiveItemState(null);
      setPaused(true);
      setTime(0);
      setDuration(undefined);
      setError(null);
      setReadyState(0);
      setNetworkState(0);
    };
  }, []);

  const isPlaying = !paused;
  const isBuffering =
    readyState < HAVE_FUTURE_DATA && networkState === NETWORK_LOADING;

  const api = useMemo<AudioPlayerApi<TData>>(
    () => ({
      activeItem,
      duration,
      error,
      isBuffering,
      isItemActive,
      isPlaying,
      pause,
      play,
      ref: audioRef,
      seek,
    }),
    [
      activeItem,
      duration,
      error,
      isBuffering,
      isItemActive,
      isPlaying,
      pause,
      play,
      seek,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={api as AudioPlayerApi<unknown>}>
      <AudioPlayerTimeContext.Provider value={time}>
        {/* biome-ignore lint/a11y/useMediaCaption: player audio is described by surrounding transcript text */}
        <audio className="hidden" ref={audioRef} />
        {children}
      </AudioPlayerTimeContext.Provider>
    </AudioPlayerContext.Provider>
  );
}

export const AudioPlayerTime = ({
  className,
  ...otherProps
}: HTMLProps<HTMLSpanElement>) => {
  const time = useAudioPlayerTime();
  return (
    <span
      {...otherProps}
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
    >
      {formatTime(time)}
    </span>
  );
};

export const AudioPlayerDuration = ({
  className,
  fallbackDuration,
  ...otherProps
}: HTMLProps<HTMLSpanElement> & { fallbackDuration?: number }) => {
  const player = useAudioPlayer();
  const duration =
    player.duration !== undefined && !Number.isNaN(player.duration)
      ? player.duration
      : fallbackDuration;
  return (
    <span
      {...otherProps}
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
    >
      {duration === undefined ? "--:--" : formatTime(duration)}
    </span>
  );
};

const Spinner = ({ className }: { className?: string }) => (
  <output aria-label="Loading" className="contents">
    <div
      className={cn(
        "size-3.5 animate-spin rounded-full border-2 border-muted border-t-foreground",
        className
      )}
    />
    <span className="sr-only">Loading…</span>
  </output>
);

interface PlayButtonProps extends ComponentProps<typeof Button> {
  iconPlaying?: boolean;
  loading?: boolean;
  onPlayingChange: (playing: boolean) => void;
  playing: boolean;
}

const PlayButton = ({
  playing,
  iconPlaying = playing,
  onPlayingChange,
  className,
  onClick,
  loading,
  "aria-label": ariaLabel,
  ...otherProps
}: PlayButtonProps) => (
  <Button
    {...otherProps}
    aria-label={ariaLabel ?? (playing ? "Pause" : "Play")}
    aria-pressed={playing}
    className={cn("relative", className)}
    onClick={(event) => {
      onPlayingChange(!playing);
      onClick?.(event);
    }}
    type="button"
  >
    {iconPlaying ? (
      <RiPauseFill
        aria-hidden="true"
        className={cn("size-4", loading && "opacity-0")}
      />
    ) : (
      <RiPlayFill
        aria-hidden="true"
        className={cn("size-4", loading && "opacity-0")}
      />
    )}
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] backdrop-blur-xs">
        <Spinner />
      </div>
    )}
  </Button>
);

export interface AudioPlayerButtonProps<TData = unknown> extends ComponentProps<
  typeof Button
> {
  item?: AudioPlayerItem<TData>;
  visualPlaying?: boolean;
}

export function AudioPlayerButton<TData = unknown>({
  item,
  visualPlaying,
  ...otherProps
}: AudioPlayerButtonProps<TData>) {
  const player = useAudioPlayer<TData>();
  const playing = item
    ? player.isItemActive(item.id) && player.isPlaying
    : player.isPlaying;
  const loading = item
    ? player.isItemActive(item.id) && player.isBuffering && player.isPlaying
    : player.isBuffering && player.isPlaying;

  return (
    <PlayButton
      {...otherProps}
      iconPlaying={visualPlaying ?? playing}
      loading={loading}
      onPlayingChange={(shouldPlay) => {
        if (shouldPlay) {
          player.play(item);
        } else {
          player.pause();
        }
      }}
      playing={playing}
    />
  );
}
