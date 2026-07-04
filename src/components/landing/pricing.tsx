import { RiCheckLine, RiSnowflakeLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const plans = [
  {
    name: "Clubhouse",
    price: "$199",
    priceSuffix: "/mo",
    description: "For courses with lighter call volume.",
    features: [
      "24/7 answering",
      "Tee sheet booking",
      "Generous minutes included",
    ],
    featured: false,
    buttonVariant: "outline" as const,
  },
  {
    name: "Championship",
    price: "$299",
    priceSuffix: "/mo",
    description:
      "For busy phones — full routing, VIP list, weekly reporting.",
    features: [
      "Everything in Clubhouse",
      "Department routing + VIP list",
      "Weekly ROI report",
    ],
    featured: true,
    buttonVariant: "default" as const,
  },
  {
    name: "Signature",
    price: "$399+",
    priceSuffix: "/mo",
    description:
      "For complex operations — member tiers, multiple booking rules, high call volume.",
    features: [
      "Everything in Championship",
      "Multi-course booking",
      "Member/public rate logic",
    ],
    featured: false,
    buttonVariant: "outline" as const,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Flat pricing. No metered surprises.
        </h2>

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "relative z-10 flex h-full flex-col shadow-lg ring-2 ring-primary md:scale-[1.03]"
                  : "flex h-full flex-col"
              }
            >
              {plan.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-0.5">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.priceSuffix}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <RiCheckLine className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  size="lg"
                  render={<a href="#pricing" />}
                  nativeButton={false}
                >
                  Start Free Pilot
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-muted-foreground">
          For less than a few hours of part-time wages a week, your phone is
          staffed around the clock.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <RiSnowflakeLine className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <p>
            Seasonal course? Annual pricing at 10 months&apos; cost, or
            hibernate for the winter at $49/mo.
          </p>
        </div>
      </div>
    </section>
  )
}
