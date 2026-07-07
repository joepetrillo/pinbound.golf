import { RiFlagLine } from "@remixicon/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface FullPageMessageProps {
  description: string;
  title: string;
}

// Centered full-viewport message used by the root not-found and error pages.
export const FullPageMessage = ({
  description,
  title,
}: FullPageMessageProps) => (
  <main
    className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center"
    id="main"
  >
    <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <RiFlagLine aria-hidden className="size-6" />
    </span>
    <div className="space-y-4">
      <h1 className="text-6xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Button
      className="rounded-full"
      nativeButton={false}
      render={<Link href="/" />}
    >
      Go back home
    </Button>
  </main>
);
