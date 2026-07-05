import { ControlRoom } from "@/components/landing/control-room";
import { Demo } from "@/components/landing/demo";
import { Faq } from "@/components/landing/faq";
import { FoundingProgram } from "@/components/landing/founding-program";
import { Hero } from "@/components/landing/hero";
import { HumanHandoff } from "@/components/landing/human-handoff";
import { PolicyFidelity } from "@/components/landing/policy-fidelity";
import { Pricing } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

const Page = () => (
  <>
    <SiteHeader />
    <main className="flex-1">
      <Hero />
      <Problem />
      <Demo />
      <PolicyFidelity />
      <ControlRoom />
      <HumanHandoff />
      <Pricing />
      <FoundingProgram />
      <Faq />
    </main>
    <SiteFooter />
  </>
);

export default Page;
