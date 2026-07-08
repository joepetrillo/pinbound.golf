import Link from "next/link";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { CONTACT_HREF } from "@/lib/site";

interface TeeSheetPlatform {
  badge: "Supported" | "Coming soon";
  id: string;
  name: string;
}

const COMING_SOON = "Coming soon";

const platforms: TeeSheetPlatform[] = [
  { badge: "Supported", id: "ezlinks", name: "EZLinks / GolfNow" },
  { badge: COMING_SOON, id: "foreup", name: "foreUP" },
  {
    badge: COMING_SOON,
    id: "lightspeed",
    name: "Lightspeed Golf (Chronogolf)",
  },
  { badge: COMING_SOON, id: "club-prophet", name: "Club Prophet" },
  { badge: COMING_SOON, id: "club-caddie", name: "Club Caddie" },
  { badge: COMING_SOON, id: "teesnap", name: "TeeSnap" },
];

export const TeeSheetIntegration = () => (
  <Section id="integrations">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
        Wired into your tee sheet
      </h2>
      <p className="mt-4 text-muted-foreground">
        Real read/write integration — availability, bookings, cancellations —
        not a lookup bolted onto a chatbot.
      </p>
    </div>

    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {platforms.map((platform) => (
        <div
          className="relative flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl bg-muted/50 px-6 transition-colors hover:bg-muted/80"
          key={platform.id}
        >
          <span className="text-center text-lg font-medium tracking-tight text-balance">
            {platform.name}
          </span>
          <Badge
            variant={platform.badge === "Supported" ? "default" : "secondary"}
          >
            {platform.badge}
          </Badge>
        </div>
      ))}
    </div>

    <p className="mt-8 text-center text-sm text-muted-foreground">
      Don&apos;t see your tee sheet?{" "}
      <Link
        className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
        href={CONTACT_HREF}
      >
        Tell us
      </Link>{" "}
      — founding courses set our integration priority.
    </p>
  </Section>
);
