import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { CTA_LABEL, FOUNDERS_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

const foundingTerms = [
  {
    description:
      "No credit card. We run it long enough to see real call volume on your line.",
    id: "free-pilot",
    title: "30 day free pilot",
  },
  {
    description:
      "After-hours forwarding only — zero risk to your main line while you review every call.",
    id: "shadow-mode",
    title: "Starts in shadow mode",
  },
  {
    description: "Walk away anytime. No annual lock-in.",
    id: "no-contract",
    title: "No contract",
  },
  {
    description:
      "Convert after the pilot and keep a discounted founding rate — stated up front, no surprises.",
    id: "founding-rate",
    title: "Founding rate if you convert",
  },
];

export const Pricing = () => (
  <Section id="pricing">
    <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
      Priced like a shift, not a system
    </h2>
    <p className="mt-4 max-w-prose text-balance text-muted-foreground">
      The pilot is free. Keep it only if it earns the job on your phones and
      your tee sheet.
    </p>

    <div className="mt-10 grid divide-y overflow-hidden rounded-2xl border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      <div className="flex flex-col p-8 md:p-10">
        <p className="text-sm font-medium text-muted-foreground">
          After the free pilot
        </p>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-5xl font-medium tracking-tight md:text-6xl">
            $299
          </span>
          <span className="text-muted-foreground">/ month</span>
        </p>
        <p className="mt-4 max-w-prose text-balance text-muted-foreground">
          Less than $10 a day, a fraction of a part-time hire.
        </p>

        <div className="mt-8 lg:mt-auto lg:pt-10">
          <a
            aria-label={CTA_LABEL}
            className={cn(buttonVariants({ size: "lg" }))}
            href={`mailto:${FOUNDERS_EMAIL}`}
          >
            {CTA_LABEL}
          </a>
          <p className="mt-4 max-w-prose text-sm text-muted-foreground">
            Tell us about your course and we&apos;ll walk through shadow-mode
            setup. Most founding courses are live on after-hours within days.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 p-8 md:p-10">
        <h3 className="text-lg font-medium tracking-tight text-balance">
          The founding course program
        </h3>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          We&apos;re onboarding a small founding cohort for the 2026 season —
          every course works directly with the founders.
        </p>

        <dl className="mt-6 divide-y">
          {foundingTerms.map((term, index) => (
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
      </div>
    </div>
  </Section>
);
