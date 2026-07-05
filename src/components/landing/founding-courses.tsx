import { Button } from "@/components/ui/button";

const TOTAL_SPOTS = 10;
const CLAIMED_SPOTS = 3;
const REMAINING_SPOTS = TOTAL_SPOTS - CLAIMED_SPOTS;

export function FoundingCourses() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-xs font-medium tracking-widest text-emerald-700 uppercase">
          Founding Course Program
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          We&apos;re onboarding 10 founding courses.
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          Free 60–90 day pilot. Shadow mode first — after-hours only, zero risk
          to your main line. No contract. Founding courses lock in founding
          pricing.
        </p>

        <div className="mt-10">
          <div className="flex gap-2" aria-hidden="true">
            {Array.from({ length: TOTAL_SPOTS }).map((_, index) => (
              <div
                key={index}
                className={
                  index < CLAIMED_SPOTS
                    ? "size-4 rounded-sm bg-emerald-600"
                    : "size-4 rounded-sm border-2 border-emerald-600/40 bg-transparent"
                }
              />
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            {REMAINING_SPOTS} of {TOTAL_SPOTS} founding spots remaining
          </p>
        </div>

        <div className="mt-8">
          <Button render={<a href="#pricing" />} nativeButton={false} size="lg">
            Claim a Founding Spot
          </Button>
        </div>
      </div>
    </section>
  );
}
