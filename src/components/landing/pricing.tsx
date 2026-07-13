import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { CTA_LABEL, FOUNDERS_EMAIL } from "@/lib/site";
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
      One product. One complete pilot.
    </h2>
    <p className="mt-4 max-w-prose text-balance text-muted-foreground">
      Test the full product on your course for 30 days after activation.
      Continue with a monthly workspace subscription sized to your call volume.
    </p>

    <div className="mt-10 grid divide-y overflow-hidden rounded-4xl border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      <div className="flex flex-col p-8 md:p-10">
        <p className="text-sm font-medium text-muted-foreground">
          After your 30-day pilot
        </p>
        <p className="mt-3 text-4xl font-medium tracking-tight text-balance md:text-5xl">
          A monthly plan matched to your call volume
        </p>
        <p className="mt-4 max-w-prose text-balance text-muted-foreground">
          One workspace subscription includes pooled minutes, every launch
          capability, clear usage reporting, and threshold alerts. No separate
          answering-only tier and no per-feature maze.
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
            Create your workspace, connect EZLinks and your phone routing, test
            privately, and activate when your team is ready.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 p-8 md:p-10">
        <h3 className="text-lg font-medium tracking-tight text-balance">
          Coverage that fits your operation
        </h3>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Agent-first is the default, with immediate human access. Choose a
          different routing mode when your operation needs it.
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
      </div>
    </div>
  </Section>
);
