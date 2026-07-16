import { Section } from "@/components/section";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const controlPoints = [
  {
    description:
      "Give callers reliable answers from approved hours, rates, booking rules, amenities, and temporary updates for frost delays or cart restrictions.",
    footer: "Time-limited updates expire automatically.",
    id: "course-knowledge",
    title: "Course knowledge",
  },
  {
    description:
      "Choose agent-first, overflow-only, busy-line, ring-no-answer, or after-hours coverage, with immediate human transfer and VIP routing.",
    footer:
      "Test privately, approve go-live, use the kill switch, and rely on automatic fallback.",
    id: "coverage-and-handoff",
    title: "Coverage and handoff",
  },
  {
    description:
      "Review recordings, transcripts, outcomes, tee-sheet actions, uncertain calls, and callback tasks in one role-based workspace.",
    footer: "Summaries and alerts keep the right people informed.",
    id: "visibility-and-control",
    title: "Visibility and control",
  },
] as const;

export const PolicyFidelity = () => (
  <Section id="control">
    <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
      Your rules. Your control.
    </h2>
    <p className="mt-4 max-w-prose leading-relaxed text-balance text-muted-foreground">
      Pinbound works from your policies, shows its work, and only handles the
      calls and tee-sheet actions you authorize.
    </p>

    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {controlPoints.map((point, index) => (
        <Card className="h-full" key={point.id}>
          <CardHeader>
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <CardTitle className="mt-3 text-lg">
              <h3 className="text-balance">{point.title}</h3>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-pretty text-muted-foreground">
              {point.description}
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
              {point.footer}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  </Section>
);
