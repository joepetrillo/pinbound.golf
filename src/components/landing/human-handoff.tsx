import { Section } from "@/components/section";
import { Card } from "@/components/ui/card";
import { Message, MessageContent } from "@/components/ui/message";
import { cn } from "@/lib/utils";

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
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
      <div>
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          &ldquo;Talk to a person&rdquo; always works
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          Callers who ask for a person get transferred immediately — no
          pushback, no script. VIP numbers on your list skip the agent and ring
          straight to the front desk.
        </p>
      </div>

      <Card className="max-w-md rounded-xl p-4 shadow-sm ring-border">
        <div className="flex flex-col gap-2">
          {handoffTranscript.map((line) => {
            const isAgent = line.role === "agent";

            return (
              <Message align={isAgent ? "start" : "end"} key={line.id}>
                <MessageContent>
                  <div
                    className={cn(
                      "w-fit max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      isAgent
                        ? "border bg-background text-foreground"
                        : "bg-muted text-foreground"
                    )}
                    data-slot="message-bubble"
                  >
                    {line.text}
                  </div>
                </MessageContent>
              </Message>
            );
          })}
        </div>
      </Card>
    </div>
  </Section>
);
