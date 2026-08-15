import Link from "next/link";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { HeroTranscript } from "@/features/landing/components/hero-transcript";
import { staggerStyle } from "@/features/landing/landing-stagger-style";
import { CTA_HREF, CTA_LABEL, DEMO_HREF, DEMO_LABEL } from "@/lib/site";
import { cn } from "@/lib/utils";

const HEADLINE_LINES = ["The pro shop assistant", "that never clocks out"];

export const Hero = () => (
  <Section className="pt-14 md:pt-20">
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div className="@container">
        {/* 10.2 is the measured width of the longer authored line plus slack. */}
        <h1
          className="text-[clamp(1.5rem,calc(100cqi/10.2),3.75rem)] leading-[1.1] font-medium tracking-tight"
          data-anim="hero-title"
        >
          {HEADLINE_LINES.map((line, index) => (
            <span data-anim="hero-mask" key={line} style={staggerStyle(index)}>
              <span data-anim="hero-line">{line}</span>
            </span>
          ))}
        </h1>
        <p
          className="mt-6 max-w-prose text-lg text-pretty text-muted-foreground"
          data-anim="hero-body"
        >
          Pinbound is an AI phone agent that answers calls 24/7, books tee times
          directly into your tee sheet, and handles routine questions according
          to your course’s policies. Every caller gets the help they need, while
          your staff stays present with the golfers right in front of them.
        </p>
        <div
          className="mt-8 flex flex-wrap items-center gap-3"
          data-anim="hero-actions"
        >
          <a className={cn(buttonVariants({ size: "lg" }))} href={CTA_HREF}>
            {CTA_LABEL}
          </a>
          <Link
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            href={DEMO_HREF}
          >
            {DEMO_LABEL}
          </Link>
        </div>
      </div>

      <HeroTranscript />
    </div>
  </Section>
);
