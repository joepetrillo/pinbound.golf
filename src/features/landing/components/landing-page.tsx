import { Demo } from "@/features/landing/components/demo";
import { Faq } from "@/features/landing/components/faq";
import { FinalCta } from "@/features/landing/components/final-cta";
import { Hero } from "@/features/landing/components/hero";
import { LandingMotion } from "@/features/landing/components/landing-motion";
import { PolicyFidelity } from "@/features/landing/components/policy-fidelity";
import { Pricing } from "@/features/landing/components/pricing";
import { Problem } from "@/features/landing/components/problem";
import { TeeSheetIntegration } from "@/features/landing/components/tee-sheet-integration";

export const LandingPage = () => (
  <LandingMotion>
    <Hero />
    <Problem />
    <PolicyFidelity />
    <TeeSheetIntegration />
    <Demo />
    <Pricing />
    <Faq />
    <FinalCta />
  </LandingMotion>
);
