import { Demo } from "@/components/landing/demo";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { LandingMotion } from "@/components/landing/landing-motion";
import { PolicyFidelity } from "@/components/landing/policy-fidelity";
import { Pricing } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { TeeSheetIntegration } from "@/components/landing/tee-sheet-integration";

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
