import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <h1 className="text-5xl font-medium tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
    <Link className={cn(buttonVariants())} href="/">
      Go back home
    </Link>
  </main>
);
