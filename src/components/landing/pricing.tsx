import { Section } from "@/components/section";

export const Pricing = () => (
  <Section id="pricing">
    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
      Priced like a shift, not a system
    </h2>

    <div className="mt-6 max-w-prose space-y-4 text-muted-foreground">
      <p>
        The pilot is free. Keep it only if it earns the job on your phones and
        your tee sheet.
      </p>
      <p>
        Less than $10 a day — a fraction of a part-time hire who only works when
        someone shows up.
      </p>
      <p className="text-foreground font-medium">
        From $299 a month after the pilot.
      </p>
    </div>
  </Section>
);
