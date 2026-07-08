import { Demo } from "@/components/landing/demo";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HomeInteractive } from "@/components/landing/home-interactive";
import { HumanHandoff } from "@/components/landing/human-handoff";
import { PolicyFidelity } from "@/components/landing/policy-fidelity";
import { Pricing } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { TeeSheetIntegration } from "@/components/landing/tee-sheet-integration";

// Sections are grouped into the four nav chunks, in nav order:
// Product (#product) → Demo (#demo) → Pricing (#pricing) → FAQ (#faq).
const Page = () => (
  <HomeInteractive>
    <Hero />
    <Problem />
    <PolicyFidelity />
    <TeeSheetIntegration />
    <HumanHandoff />
    <Demo />
    <Pricing />
    <Faq />
    <FinalCta />
  </HomeInteractive>
);

export default Page;
