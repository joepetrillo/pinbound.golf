import type { Metadata } from "next";
import { Suspense } from "react";

import { Section } from "@/components/section";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import {
  AccountSummary,
  AccountSummarySkeleton,
} from "@/features/user/components/account-summary";

export const metadata: Metadata = {
  description: "Your Pinbound account dashboard.",
  title: "Dashboard — Pinbound",
};

const DashboardPage = () => (
  <Section className="pt-16 md:pt-20">
    <header>
      <h1 className="text-3xl font-medium tracking-tight text-balance md:text-4xl">
        Dashboard
      </h1>
    </header>
    <SectionErrorBoundary title="Your account details didn't load.">
      <Suspense fallback={<AccountSummarySkeleton />}>
        <AccountSummary />
      </Suspense>
    </SectionErrorBoundary>
  </Section>
);

export default DashboardPage;
