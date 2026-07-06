"use client";

import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { icon: RiSunLine, label: "Light theme", value: "light" },
  { icon: RiMoonLine, label: "Dark theme", value: "dark" },
  { icon: RiComputerLine, label: "System theme", value: "system" },
] as const;

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const subscribeToClient = (_onStoreChange: () => void) => () => {
  // Snapshot is static; no external store to subscribe to.
};

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot
  );

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border p-0.5",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = mounted && theme === option.value;
        return (
          <button
            aria-label={option.label}
            aria-pressed={isActive}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-muted text-foreground"
            )}
            key={option.value}
            onClick={() => setTheme(option.value)}
            type="button"
          >
            <option.icon aria-hidden className="size-4" />
          </button>
        );
      })}
    </div>
  );
};
