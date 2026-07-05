import { RiPhoneLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <div className="rounded-2xl bg-zinc-950 px-6 py-16 text-center text-white">
          <div className="mx-auto mb-8 max-w-xs">
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)]"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center gap-4">
                <div className="relative flex size-12 items-center justify-center rounded-full bg-emerald-600/20">
                  <RiPhoneLine className="size-6 animate-pulse text-emerald-400" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                </div>
                <div
                  className="flex h-8 items-end justify-center gap-1"
                  aria-hidden="true"
                >
                  {[3, 5, 7, 4, 8, 5, 3].map((height, index) => (
                    <span
                      key={index}
                      className="w-1 rounded-full bg-emerald-500/70"
                      style={{
                        animation: `pulse 1.${(index % 3) + 2}s ease-in-out infinite`,
                        animationDelay: `${index * 0.1}s`,
                        height: `${height * 3}px`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-400">
                  Closed at 6. Still booking at 9.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Your phone is ringing right now.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-zinc-400">
            Start a free pilot — shadow mode, after-hours only, cancel anytime.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-zinc-950 hover:bg-zinc-100"
              render={<a href="#pricing" />}
              nativeButton={false}
            >
              Get a Free Pilot
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-600 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
              render={<a href="#demo" />}
              nativeButton={false}
            >
              Talk to the Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
