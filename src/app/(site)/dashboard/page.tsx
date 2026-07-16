import { signOut, withAuth } from "@workos-inc/authkit-nextjs";
import type { Metadata } from "next";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  description: "Your Pinbound account dashboard.",
  title: "Dashboard — Pinbound",
};

const DashboardPage = async () => {
  const { user } = await withAuth({ ensureSignedIn: true });

  return (
    <Section className="pt-16 md:pt-20">
      <header>
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-4 max-w-prose leading-relaxed text-pretty text-muted-foreground">
          Welcome back
          {user.firstName ? `, ${user.firstName}` : ""}.
        </p>
        {user.email ? (
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        ) : null}
      </header>

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
        className="mt-8"
      >
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </Section>
  );
};

export default DashboardPage;
