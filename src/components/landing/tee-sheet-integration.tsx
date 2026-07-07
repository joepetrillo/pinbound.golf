import Link from "next/link";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_HREF } from "@/lib/site";

interface TeeSheetPlatform {
  badge: "Supported" | "Coming soon";
  id: string;
  name: string;
}

const platforms: TeeSheetPlatform[] = [
  { badge: "Supported", id: "ezlinks", name: "EZLinks / GolfNow" },
  { badge: "Coming soon", id: "foreup", name: "foreUP" },
  { badge: "Coming soon", id: "lightspeed", name: "Lightspeed Golf (Chronogolf)" },
  { badge: "Coming soon", id: "club-prophet", name: "Club Prophet" },
  { badge: "Coming soon", id: "club-caddie", name: "Club Caddie" },
  { badge: "Coming soon", id: "teesnap", name: "TeeSnap" },
];

export const TeeSheetIntegration = () => (
  <Section id="integrations">
    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
      Wired into your tee sheet.
    </h2>
    <p className="mt-4 max-w-prose text-muted-foreground">
      Real read/write integration — availability, bookings, cancellations — not a
      lookup bolted onto a chatbot.
    </p>

    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {platforms.map((platform) => (
        <Card key={platform.id} className="rounded-xl shadow-sm ring-border">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <span className="font-medium">{platform.name}</span>
            <Badge
              variant={platform.badge === "Supported" ? "default" : "secondary"}
            >
              {platform.badge}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="mt-6 rounded-xl border-dashed shadow-none ring-border">
      <CardContent className="p-5">
        <p className="font-medium">Not seeing yours?</p>
        <p className="mt-2 text-muted-foreground">
          Tell us your tee sheet — founding courses set our integration
          priority.{" "}
          <Link
            className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            href={CONTACT_HREF}
          >
            Get in touch
          </Link>
        </p>
      </CardContent>
    </Card>
  </Section>
);
