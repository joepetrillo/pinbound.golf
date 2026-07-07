import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

const SiteLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <SiteHeader />
    <main className="flex-1 pt-site-header" id="main">
      {children}
    </main>
    <SiteFooter />
  </>
);

export default SiteLayout;
