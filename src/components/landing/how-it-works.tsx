import {
  RiCalendarCheckLine,
  RiPhoneLine,
  RiUserSharedLine,
} from "@remixicon/react"

const steps = [
  {
    step: "Step 1",
    icon: RiPhoneLine,
    title: "Answers instantly",
    body: "Every call, every hour, in a natural voice — no menus, no hold music.",
  },
  {
    step: "Step 2",
    icon: RiCalendarCheckLine,
    title: "Resolves against your tee sheet",
    body: "Books, cancels, and modifies real reservations. Answers rates, hours, and policy questions from your own info.",
  },
  {
    step: "Step 3",
    icon: RiUserSharedLine,
    title: "Routes what needs a person",
    body: "\u201CTalk to someone\u201D always works — instant transfer during hours, a structured message after.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Answer. Resolve. Route.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ step, icon: Icon, title, body }) => (
            <div
              key={step}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Icon className="size-5" />
              </div>
              <p className="mt-5 text-xs tracking-wide text-muted-foreground uppercase">
                {step}
              </p>
              <h3 className="mt-2 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
