import { Section } from "@/components/section";
import { Card } from "@/components/ui/card";

interface HandoffLine {
  id: string;
  role: "agent" | "caller";
  text: string;
}

const handoffTranscript: HandoffLine[] = [
  { id: "handoff-1", role: "caller", text: "Can I talk to a person?" },
  { id: "handoff-2", role: "agent", text: "Of course — connecting you now." },
];

export const HumanHandoff = () => (
  <Section>
    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
      &ldquo;Talk to a person&rdquo; always works
    </h2>
    <p className="mt-4 max-w-prose text-muted-foreground">
      Callers who ask for a person get transferred immediately — no pushback, no
      script. VIP numbers on your list skip the agent and ring straight to the
      front desk.
    </p>

    <Card className="mt-6 max-w-md rounded-xl p-4 shadow-sm ring-border">
      <div className="space-y-2">
        {handoffTranscript.map((line) => (
          <p key={line.id} className="text-sm">
            <span className="font-medium capitalize">{line.role}:</span>{" "}
            <span className="text-muted-foreground">{line.text}</span>
          </p>
        ))}
      </div>
    </Card>
  </Section>
);
