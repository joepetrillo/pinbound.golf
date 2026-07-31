import { RiArrowRightLine } from "@remixicon/react";

export const ReadingTime = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-foreground uppercase">
    {label}
    <RiArrowRightLine
      aria-hidden="true"
      className="size-3.5 motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.19,1,0.22,1)] motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1 motion-safe:group-focus-visible:duration-0"
    />
  </span>
);
