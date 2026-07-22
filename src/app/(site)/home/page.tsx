import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export { LandingPage as default } from "@/components/landing/landing-page";
