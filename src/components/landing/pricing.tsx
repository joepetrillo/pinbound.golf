import Link from "next/link";

import { PricingEstimator } from "@/components/landing/pricing-estimator";
import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { CTA_HREF, CTA_LABEL } from "@/lib/site";
import { cn } from "@/lib/utils";

const pilotTerms = [
  {
    description:
      "The clock starts after your assistant is configured, tested, and active — not when you create the workspace.",
    id: "free-pilot",
    title: "30-day pilot",
  },
  {
    description:
      "Call a private test assistant, review its answers and tee-sheet actions, then explicitly approve your course for go-live.",
    id: "you-approve-go-live",
    title: "You approve go-live",
  },
  {
    description:
      "See minutes, pooled workspace usage, tee-sheet actions, and threshold alerts before you exceed your included usage.",
    id: "no-contract",
    title: "Clear usage",
  },
  {
    description:
      "Pinbound does not stop answering when you reach a usage threshold. You receive warnings and can move to the right allowance without unexpected silence.",
    id: "continuous-service",
    title: "No surprise shutoff",
  },
];

export const Pricing = () => (
  <Section id="pricing">
    <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
      Pricing that follows your call volume
    </h2>
    <p className="mt-4 max-w-prose text-balance text-muted-foreground">
      Start with the complete product free for 30 days after activation, then
      continue with a monthly workspace subscription sized to your calls.
    </p>

    <div className="mt-10 grid divide-y overflow-hidden rounded-4xl border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      <PricingEstimator />

      <div className="bg-muted/50 p-8 md:p-10">
        <h3 className="text-xl font-medium tracking-tight text-balance">
          Every estimate includes the complete pilot
        </h3>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          No answering-only tier and no per-feature maze. Configure, test, and
          approve the full experience before your paid plan begins.
        </p>

        <dl className="mt-6 divide-y">
          {pilotTerms.map((term, index) => (
            <div className="flex gap-4 py-4 first:pt-0 last:pb-0" key={term.id}>
              <span className="pt-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <dt className="font-medium text-foreground">{term.title}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {term.description}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <Link className={cn(buttonVariants({ size: "lg" }))} href={CTA_HREF}>
            {CTA_LABEL}
          </Link>
          <p className="mt-4 max-w-prose text-sm text-muted-foreground">
            Create your workspace, connect your tee sheet and phone routing,
            test privately, and activate when your team is ready.
          </p>
        </div>
      </div>
    </div>
  </Section>
);
