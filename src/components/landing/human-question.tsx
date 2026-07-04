import {
  RiStarLine,
  RiUserVoiceLine,
  RiVerifiedBadgeLine,
} from "@remixicon/react"

import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: RiUserVoiceLine,
    title: "Instant handoff",
    description: (
      <>
        &ldquo;Talk to a person&rdquo; is never argued with.
      </>
    ),
  },
  {
    icon: RiStarLine,
    title: "VIP list",
    description: "Your members-of-note ring through to staff, always.",
  },
  {
    icon: RiVerifiedBadgeLine,
    title: "Honest identity",
    description: (
      <>
        Always discloses it&apos;s an AI assistant. Trust first.
      </>
    ),
  },
]

export function HumanQuestion() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Your regulars still get your staff.
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          Pinbound introduces itself honestly as your virtual assistant,
          transfers instantly whenever a caller asks for a person, and lets you
          set a VIP list that always rings straight through. It takes the
          routine 70% so your team is free for the calls that build
          relationships.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="rounded-xl shadow-sm ring-border"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon className="size-5 text-emerald-700" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
