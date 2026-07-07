// Micro trust strip — lighter than a full Section.
export const ReliabilityStrip = () => (
  <aside className="border-y border-border bg-muted/30 px-4 py-8 md:px-6">
    <div className="mx-auto max-w-6xl text-center">
      <p className="font-medium">
        The agent never confirms what the tee sheet didn&apos;t return.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Every change is tested against a simulated-call suite before it ever
        takes a live call.
      </p>
    </div>
  </aside>
);
