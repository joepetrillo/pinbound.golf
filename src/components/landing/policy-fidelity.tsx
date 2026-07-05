import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TranscriptLine {
  id: string;
  speaker: "agent" | "caller";
  text: string;
}

const policyRule = {
  label: "Phone bookings",
  value: "Same-day only. Further out: online only.",
};

const transcriptLines: TranscriptLine[] = [
  {
    id: "caller-request",
    speaker: "caller",
    text: "I'd like to book a tee time for Saturday the 12th — two players.",
  },
  {
    id: "agent-policy",
    speaker: "agent",
    text: "Phone bookings at Pinehills are same-day only. For that Saturday I can text you our online booking link — want me to send it?",
  },
  {
    id: "caller-accept",
    speaker: "caller",
    text: "Yeah, that works.",
  },
  {
    id: "agent-confirm",
    speaker: "agent",
    text: "Done — link sent to the number you're calling from.",
  },
];

interface TranscriptBubbleProps {
  line: TranscriptLine;
}

const TranscriptBubble = ({ line }: TranscriptBubbleProps) => {
  const isAgent = line.speaker === "agent";

  return (
    <div
      className={cn(
        "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
        isAgent
          ? "self-start border bg-background text-foreground"
          : "self-end bg-muted text-foreground"
      )}
    >
      <span className="mb-1 block text-[10px] font-medium tracking-wide text-foreground/70 uppercase">
        {isAgent ? "Agent" : "Caller"}
      </span>
      {line.text}
    </div>
  );
};

export const PolicyFidelity = () => (
  <Section id="product">
    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
      It follows your rules, not a script
    </h2>
    <p className="mt-4 max-w-prose text-muted-foreground">
      Generic agents say yes to everything. Yours follows your rules — the same
      policies your staff enforces at the counter.
    </p>

    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
      <Card className="rounded-xl shadow-sm ring-border">
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Incoming call
          </p>
          {transcriptLines.map((line) => (
            <TranscriptBubble key={line.id} line={line} />
          ))}
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-muted/40 p-4 lg:sticky lg:top-24">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Rule in your dashboard
        </p>
        <div className="mt-3 rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed">
          <p className="text-muted-foreground">{policyRule.label}</p>
          <p className="mt-1 font-medium text-foreground">{policyRule.value}</p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          You set this once. Every call checks it before confirming anything on
          the tee sheet.
        </p>
      </div>
    </div>
  </Section>
);
