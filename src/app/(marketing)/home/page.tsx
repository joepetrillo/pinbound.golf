import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export { LandingPage as default } from "@/features/landing/components/landing-page";
