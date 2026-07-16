import { RiArrowRightLine } from "@remixicon/react";

export const ReadingTime = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-foreground uppercase">
    {label}
    <RiArrowRightLine
      aria-hidden="true"
      className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
    />
  </span>
);
