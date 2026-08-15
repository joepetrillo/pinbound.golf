import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderAccount } from "@/features/user/components/site-header-account";

const SiteLayout = ({ children }: LayoutProps<"/">) => (
  <>
    <SiteHeader accountControl={<SiteHeaderAccount />} />
    <main className="flex-1 pt-site-header" id="main">
      {children}
    </main>
    <SiteFooter />
  </>
);

export default SiteLayout;
