import { RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTACT_HREF } from "@/lib/site";
import { cn } from "@/lib/utils";

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
    <div className="max-w-2xl">
      <h2 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Wired into your tee sheet
      </h2>
      <p className="mt-4 leading-relaxed text-balance text-muted-foreground">
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

    <Card className="relative col-span-2 mt-8 md:grid md:grid-cols-[1fr_auto] md:items-center">
      <CardHeader className="relative">
        <CardTitle>
          <h3 className="text-xl font-medium tracking-tight text-balance">
            Don&apos;t see your tee sheet?
          </h3>
        </CardTitle>
        <CardDescription className="max-w-xl leading-relaxed text-balance">
          Founding courses shape what we connect next. Tell us what your shop
          runs and move it up the list.
        </CardDescription>
      </CardHeader>
      <CardFooter className="relative md:pl-0">
        <Link
          className={cn(buttonVariants({ className: "w-fit shrink-0" }))}
          href={CONTACT_HREF}
        >
          Request your integration
          <RiArrowRightLine aria-hidden data-icon="inline-end" />
        </Link>
      </CardFooter>
    </Card>
  </Section>
);
