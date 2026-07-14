import type { Metadata } from "next";

import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FOUNDERS_EMAIL, PILOT_EMAIL_HREF, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description:
    "Plan a founder-led Pinbound pilot for your golf course, from private testing through approved go-live.",
  title: "Plan your pilot — Pinbound",
};

const firstEmailDetails = [
  "Your course name and location",
  "The tee sheet you use today",
  "Your approximate monthly call volume",
  "Where you want coverage: agent-first, overflow, ring-no-answer, or after-hours",
] as const;

const pilotSteps = [
  {
    description:
      "Tell us about your operation, tee sheet, call volume, and the calls that interrupt your team most often.",
    title: "Start with your course",
  },
  {
    description:
      "We will confirm the current integration fit, answer questions, and outline what Pinbound can handle safely at launch.",
    title: "Confirm the fit",
  },
  {
    description:
      "Configure your rules and routing, call a private test assistant, review its work, and approve go-live only when your team is ready.",
    title: "Test before callers hear it",
  },
] as const;

const GetStartedPage = () => (
  <Section className="pt-16 md:pt-20">
    <header className="max-w-3xl">
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Plan your Pinbound pilot
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-pretty text-muted-foreground">
        Founding courses get a free 30-day pilot and direct help from the people
        building {SITE_NAME}. We configure the first version together, test it
        on a private number, and activate it only after your team approves the
        answers, routing, and tee-sheet actions.
      </p>
    </header>

    <div className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <div>
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          What happens next
        </h2>
        <ol className="mt-8 flex flex-col gap-8">
          {pilotSteps.map((step, index) => (
            <li className="grid grid-cols-[2rem_1fr] gap-4" key={step.title}>
              <span className="pt-1 text-sm font-medium text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-2 max-w-prose leading-relaxed text-pretty text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            A useful first email includes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary">
            {firstEmailDetails.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex-col items-start gap-5">
          <a
            className={cn(buttonVariants({ size: "lg" }))}
            href={PILOT_EMAIL_HREF}
          >
            Email {FOUNDERS_EMAIL}
          </a>
          <p className="text-sm leading-relaxed text-muted-foreground">
            EZLinks / GolfNow is supported first. If you use another tee sheet,
            tell us which one—new adapters are prioritized by course demand.
          </p>
          <p className="text-sm text-muted-foreground">
            Prefer to write from your own inbox? {FOUNDERS_EMAIL}
          </p>
        </CardFooter>
      </Card>
    </div>
  </Section>
);

export default GetStartedPage;
