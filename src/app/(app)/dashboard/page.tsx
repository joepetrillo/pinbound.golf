import { signOut, withAuth } from "@workos-inc/authkit-nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Section } from "@/components/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { MARKETING_HOME_HREF } from "@/lib/site";

export const metadata: Metadata = {
  description: "Your Pinbound account dashboard.",
  title: "Dashboard — Pinbound",
};

const DashboardAccount = async () => {
  const { user } = await withAuth({ ensureSignedIn: true });

  return (
    <div className="mt-4">
      <p className="max-w-prose leading-relaxed text-pretty text-muted-foreground">
        Welcome back
        {user.firstName ? `, ${user.firstName}` : ""}.
      </p>
      {user.email ? (
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          {user.email}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link className={buttonVariants()} href={MARKETING_HOME_HREF}>
          View site
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
};

const DashboardPage = () => (
  <Section className="pt-16 md:pt-20">
    <header>
      <h1 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Dashboard
      </h1>
    </header>
    <Suspense
      fallback={
        <p
          aria-live="polite"
          className="mt-4 text-pretty text-muted-foreground"
        >
          Loading your account…
        </p>
      }
    >
      <DashboardAccount />
    </Suspense>
  </Section>
);

export default DashboardPage;
