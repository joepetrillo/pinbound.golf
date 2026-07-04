import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LiveDemo } from "@/components/landing/live-demo";
import { YourRules } from "@/components/landing/your-rules";
import { HumanQuestion } from "@/components/landing/human-question";
import { ControlRoom } from "@/components/landing/control-room";
import { Integrations } from "@/components/landing/integrations";
import { FoundingCourses } from "@/components/landing/founding-courses";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

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
