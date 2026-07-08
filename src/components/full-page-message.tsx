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
    <div className="space-y-4">
      <h1 className="text-6xl font-medium tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
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
