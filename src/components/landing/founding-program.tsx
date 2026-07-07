import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CTA_LABEL,
  FOUNDING_SPOTS_LEFT,
  FOUNDING_SPOTS_TOTAL,
} from "@/lib/site";

const foundingTerms = [
  {
    description:
      "No credit card. We run it long enough to see real call volume on your line.",
    id: "free-pilot",
    title: "60–90 day free pilot",
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

export const FoundingProgram = () => (
  <Section id="founding">
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            The Founding Course Program
          </h2>
          <Badge variant="outline">
            {FOUNDING_SPOTS_LEFT} of {FOUNDING_SPOTS_TOTAL} spots left
          </Badge>
        </div>

        <div className="mt-10 max-w-prose">
          <Button
            nativeButton={false}
            render={
              <a aria-label={CTA_LABEL} href="mailto:founders@pinbound.golf" />
            }
            size="lg"
          >
            {CTA_LABEL}
          </Button>
          <p className="mt-4 text-muted-foreground">
            Tell us about your course and we&apos;ll walk through shadow-mode
            setup. Most founding courses are live on after-hours within days.
          </p>
        </div>
      </div>

      <dl className="max-w-prose space-y-5">
        {foundingTerms.map((term) => (
          <div key={term.id}>
            <dt className="font-medium text-foreground">{term.title}</dt>
            <dd className="mt-1 text-muted-foreground">{term.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  </Section>
);
