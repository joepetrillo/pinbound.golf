import {
  RiEqualizer2Line,
  RiFileList3Line,
  RiShieldCheckLine,
} from "@remixicon/react";

import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

const policyRules = [
  {
    id: "phone-bookings",
    label: "Phone bookings",
    value: "Same-day only. Further out: online only.",
  },
  {
    id: "cancellations",
    label: "Cancellations",
    value: "24 hours' notice. Inside that: transfer to shop.",
  },
];

const autonomyStages = ["After-hours", "Overflow", "Full line"];

export const PolicyFidelity = () => (
  <Section>
    <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
      Your rules. Your control.
    </h2>
    <p className="mt-4 max-w-prose text-muted-foreground">
      Generic agents say yes to everything. Yours follows your rules — the same
      policies your staff enforces at the counter.
    </p>

    <div className="mt-10 grid gap-6 md:grid-cols-3">
      <Card className="rounded-xl shadow-sm ring-border">
        <CardContent className="flex h-full flex-col p-6">
          <RiShieldCheckLine
            aria-hidden="true"
            className="size-5 text-primary"
          />
          <h3 className="mt-4 font-medium">Rules you write once</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Plain-English policies, editable anytime — live. Every call checks
            them before confirming anything on the tee sheet.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {policyRules.map((rule) => (
              <div
                className="rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed"
                key={rule.id}
              >
                <p className="text-muted-foreground">{rule.label}</p>
                <p className="mt-1 font-medium text-foreground">{rule.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm ring-border">
        <CardContent className="flex h-full flex-col p-6">
          <RiFileList3Line aria-hidden="true" className="size-5 text-primary" />
          <h3 className="mt-4 font-medium">Every call on the record</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Every call is logged with a transcript and audio, so you can review
            exactly what was said — and tighten a rule the moment you spot a
            gap.
          </p>
          <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed">
            <p className="font-medium">Sat 8:14 AM · Booking · 0:38</p>
            <p className="mt-1 text-muted-foreground">
              Transcript + audio · booked 7:40 AM, 2 players
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm ring-border">
        <CardContent className="flex h-full flex-col p-6">
          <RiEqualizer2Line
            aria-hidden="true"
            className="size-5 text-primary"
          />
          <h3 className="mt-4 font-medium">You set the autonomy</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Start it on after-hours only, widen it as it earns trust — the GM
            decides when it takes more. VIP numbers always ring straight to
            staff.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {autonomyStages.map((stage, index) => (
              <div className="flex items-center gap-2" key={stage}>
                {index > 0 ? (
                  <span aria-hidden="true" className="h-px w-3 bg-border" />
                ) : null}
                <span
                  className={
                    index === 0
                      ? "rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium"
                      : "rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                  }
                >
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </Section>
);
