import { Demo } from "@/components/landing/demo";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HomeInteractive } from "@/components/landing/home-interactive";
import { PolicyFidelity } from "@/components/landing/policy-fidelity";
import { Pricing } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { TeeSheetIntegration } from "@/components/landing/tee-sheet-integration";

// The page moves from problem to proof to commitment. The logo returns visitors
// to the beginning; the primary nav jumps to the three decision sections.
const Page = () => (
  <HomeInteractive>
    <Hero />
    <Problem />
    <PolicyFidelity />
    <TeeSheetIntegration />
    <Demo />
    <Pricing />
    <Faq />
    <FinalCta />
  </HomeInteractive>
);

export default Page;
