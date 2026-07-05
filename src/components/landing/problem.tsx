import { RiPhoneLine } from "@remixicon/react";

const missedCalls = [
  { number: "(555) 284-0193", time: "Yesterday 8:42 PM" },
  { number: "(555) 901-4472", time: "Yesterday 7:15 PM" },
  { number: "(555) 338-7721", time: "Yesterday 6:03 PM" },
];

export function Problem() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          The 6 PM problem
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Your phone rings more than your staff can answer.
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-muted/40 p-6">
            <p className="text-4xl font-extrabold text-emerald-700">81%</p>
            <p className="mt-3 text-muted-foreground">
              of after-hours calls to golf courses go unanswered or hit
              voicemail.
            </p>
          </div>
          <div className="rounded-xl bg-muted/40 p-6">
            <p className="text-lg font-bold">Peak hours</p>
            <p className="mt-3 text-muted-foreground">
              Callers wait on hold while your team checks in the morning wave.
            </p>
          </div>
          <div className="rounded-xl bg-muted/40 p-6">
            <p className="text-lg font-bold">Every ring-out</p>
            <p className="mt-3 text-muted-foreground">
              is a booking made somewhere else — or a golfer who won&apos;t call
              back.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl bg-zinc-950 p-5 shadow-lg">
          <p className="mb-4 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Missed calls
          </p>
          <div className="flex flex-col gap-2">
            {missedCalls.map((call) => (
              <div
                key={call.time}
                className="flex items-center gap-3 rounded-lg bg-zinc-900/80 px-4 py-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                  <RiPhoneLine className="size-4 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    Missed call · {call.time}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {call.number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
