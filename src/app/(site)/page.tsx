import { Demo } from "@/components/landing/demo";
import { Faq } from "@/components/landing/faq";
import { FoundingProgram } from "@/components/landing/founding-program";
import { Hero } from "@/components/landing/hero";
import { HumanHandoff } from "@/components/landing/human-handoff";
import { PolicyFidelity } from "@/components/landing/policy-fidelity";
import { Pricing } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { ReliabilityStrip } from "@/components/landing/reliability-strip";
import { TeeSheetIntegration } from "@/components/landing/tee-sheet-integration";

const Page = () => (
  <>
    <Hero />
    <Problem />
    <Demo />
    <ReliabilityStrip />
    <PolicyFidelity />
    <TeeSheetIntegration />
    <HumanHandoff />
    <Pricing />
    <FoundingProgram />
    <Faq />
  </>
);

export default Page;
