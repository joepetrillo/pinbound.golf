import Link from "next/link";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { CTA_HREF, CTA_LABEL, DEMO_HREF, DEMO_LABEL } from "@/lib/site";
import { cn } from "@/lib/utils";

// Closing CTA band — the last thing a full-page scroller sees.
export const FinalCta = () => (
  <Section className="border-t">
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Ready to stop missing calls?
      </h2>
      <p className="mt-4 text-muted-foreground">
        Free 30 day pilot. No contract. Setup in minutes.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
  </Section>
);
