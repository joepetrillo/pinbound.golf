import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

// The one container every landing section uses: shared max width, horizontal
// padding, vertical rhythm, and scroll offset for the sticky header.
export const Section = ({ children, className, id }: SectionProps) => (
  <section className={cn("scroll-mt-20 py-16 md:py-24", className)} id={id}>
    <div className="mx-auto w-full max-w-5xl px-5">{children}</div>
  </section>
);
