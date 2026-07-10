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
      "Write your booking, cancellation, and transfer policies in plain English. Pinbound follows the same rules your staff uses at the counter.",
    footer: "Update a policy whenever your operation changes.",
    id: "playbook",
    title: "Set the playbook",
  },
  {
    description:
      "Every call includes a transcript, outcome, and the policy behind the answer. You can see exactly what happened without guessing.",
    footer: "Clear records. No black-box decisions.",
    id: "review",
    title: "Review every call",
  },
  {
    description:
      "Start with after-hours coverage, add overflow when the shop gets busy, and expand only when you are comfortable with the results.",
    footer: "Pause it or narrow coverage at any time.",
    id: "coverage",
    title: "Choose the coverage",
  },
] as const;

export const PolicyFidelity = () => (
  <Section id="control">
    <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
      Your rules. Your control.
    </h2>
    <p className="mt-4 max-w-prose leading-relaxed text-balance text-muted-foreground">
      Pinbound works from your policies, shows its work, and only handles the
      calls you choose to give it.
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
