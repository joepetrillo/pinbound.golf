import {
  RiArrowRightLine,
  RiCalendarLine,
  RiShieldCheckLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const ruleChips = [
  "Booking windows",
  "Same-day-only phone rules",
  "Member vs. public rates",
  "Multi-course facilities",
  "Cancellation cutoffs",
  "Cart & walking rules",
  "Outing thresholds",
  "Department routing",
]

export function YourRules() {
  return (
    <section id="rules" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          It runs on your rules — not a script.
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          Generic AI agents book anything for anyone. Pinbound enforces your
          booking window, your rate classes, your phone-booking policy —
          verified with test calls before it ever answers a real one. Change a
          rule in your dashboard and it&apos;s followed on the very next call.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {ruleChips.map((chip) => (
            <Badge
              key={chip}
              variant="secondary"
              className="rounded-full px-3 py-1 text-sm"
            >
              {chip}
            </Badge>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-stretch md:justify-center md:gap-3">
            {/* Caller request */}
            <Card className="w-full max-w-xs rounded-xl shadow-sm ring-border">
              <CardContent className="p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Caller request
                </p>
                <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">&ldquo;</span>
                  Can I book next Saturday?
                  <span className="text-muted-foreground">&rdquo;</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex shrink-0 items-center justify-center text-muted-foreground md:rotate-0">
              <RiArrowRightLine className="hidden size-5 md:block" />
              <RiArrowRightLine className="size-5 rotate-90 md:hidden" />
            </div>

            {/* Policy check */}
            <Card className="w-full max-w-xs rounded-xl border-emerald-200/60 shadow-sm ring-emerald-100">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                    <RiShieldCheckLine className="size-4 text-emerald-700" />
                  </div>
                  <p className="text-sm font-medium">Policy check</p>
                </div>
                <ul className="space-y-1.5 text-sm">
                  <li className="text-emerald-700">✓ Same-day rule</li>
                  <li className="text-emerald-700">✓ Party size</li>
                  <li className="text-red-600">✗ Outside booking window</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex shrink-0 items-center justify-center text-muted-foreground">
              <RiArrowRightLine className="hidden size-5 md:block" />
              <RiArrowRightLine className="size-5 rotate-90 md:hidden" />
            </div>

            {/* Tee sheet */}
            <Card className="w-full max-w-xs rounded-xl shadow-sm ring-border">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <RiCalendarLine className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Tee sheet</p>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${
                        i === 5 || i === 8
                          ? "bg-emerald-100 ring-1 ring-emerald-300"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sat 7:40 AM · 4 players
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Rules enforced server-side — before the tee sheet is ever touched.
          </p>
        </div>
      </div>
    </section>
  )
}
