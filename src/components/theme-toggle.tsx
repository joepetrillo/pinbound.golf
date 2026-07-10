"use client";

import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const selectedTheme = mounted && theme ? [theme] : [];

  return (
    <ToggleGroup
      aria-label="Appearance"
      className={className}
      onValueChange={(themes) => {
        const nextTheme = themes.at(-1);
        if (nextTheme) {
          setTheme(nextTheme);
        }
      }}
      spacing={1}
      value={selectedTheme}
      variant="outline"
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem
          aria-label={option.label}
          key={option.value}
          value={option.value}
        >
          <option.icon aria-hidden />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
