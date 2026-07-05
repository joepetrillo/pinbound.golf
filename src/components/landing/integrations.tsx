import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const vendors = [
  { name: "EZLinks", status: "live" as const },
  { name: "GolfNow / G1", status: "coming" as const },
  { name: "foreUP", status: "coming" as const },
  { name: "Lightspeed Golf", status: "coming" as const },
  { name: "Club Prophet", status: "coming" as const },
  { name: "Club Caddie", status: "coming" as const },
];

export function Integrations() {
  return (
    <section id="integrations" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Connected to your real tee sheet.
        </h2>
        <p className="mt-4 max-w-prose text-muted-foreground">
          Full read/write integration — Pinbound books, cancels, and modifies
          actual reservations. Not a message-taker. And if your tee sheet
          isn&apos;t listed yet, we&apos;ll build the connection for you.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {vendors.map((vendor) => (
            <div
              key={vendor.name}
              className="relative flex h-16 items-center justify-center rounded-lg border bg-background"
            >
              <span className="text-center text-lg font-semibold text-muted-foreground">
                {vendor.name}
              </span>
              {vendor.status === "live" ? (
                <Badge className="absolute right-2 top-2 bg-emerald-700 text-white hover:bg-emerald-700">
                  Live
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="absolute right-2 top-2 text-xs text-muted-foreground"
                >
                  Coming soon
                </Badge>
              )}
            </div>
          ))}
        </div>

        <Card className="mx-auto mt-10 max-w-md rounded-xl text-center shadow-sm ring-border">
          <CardContent className="p-6">
            <h3 className="font-semibold">Don&apos;t see yours?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us your tee sheet system — adding support for your course is
              part of onboarding.
            </p>
            <Button variant="outline" className="mt-4" render={<a href="#" />}>
              Request Your Tee Sheet
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
