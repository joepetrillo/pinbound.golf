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
      "Add your hours, rates, booking rules, amenities, and handoff destinations. Schedule frost delays, closures, and cart rules to expire automatically.",
    footer: "Required setup keeps every course at a reliable baseline.",
    id: "playbook",
    title: "Set the playbook",
  },
  {
    description:
      "Recordings, transcripts, outcomes, transfers, tee-sheet actions, uncertain calls, and callback tasks stay searchable in one role-based workspace.",
    footer: "Daily summaries and alerts keep the right people informed.",
    id: "review",
    title: "Review every call",
  },
  {
    description:
      "Run agent-first, overflow-only, busy-line, ring-no-answer, or after-hours coverage. Test privately, approve go-live, and restore normal routing with the kill switch.",
    footer: "Automatic fallback keeps outages from becoming dead air.",
    id: "coverage",
    title: "Choose the coverage",
  },
  {
    description:
      "Callers who ask for a person transfer immediately, without pushback or a script. Recognized VIP numbers can skip the assistant and ring your team directly.",
    footer:
      "If nobody answers, Pinbound captures the reason and creates a callback task.",
    id: "human-handoff",
    title: "Keep people within reach",
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

    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
