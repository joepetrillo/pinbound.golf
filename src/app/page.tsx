import { ControlRoom } from "@/components/landing/control-room";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { FoundingCourses } from "@/components/landing/founding-courses";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { HumanQuestion } from "@/components/landing/human-question";
import { Integrations } from "@/components/landing/integrations";
import { LiveDemo } from "@/components/landing/live-demo";
import { Pricing } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { YourRules } from "@/components/landing/your-rules";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <LiveDemo />
        <YourRules />
        <HumanQuestion />
        <ControlRoom />
        <Integrations />
        <FoundingCourses />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
