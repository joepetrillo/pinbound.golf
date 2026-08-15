import {
  AuthKitProvider,
  Impersonation,
} from "@workos-inc/authkit-nextjs/components";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderAccount } from "@/features/user/components/site-header-account";

const SiteLayout = ({ children }: LayoutProps<"/">) => (
  <AuthKitProvider>
    <Impersonation />
    <SiteHeader accountControl={<SiteHeaderAccount />} />
    <main className="flex-1 pt-site-header" id="main">
      {children}
    </main>
    <SiteFooter />
  </AuthKitProvider>
);

export default SiteLayout;
