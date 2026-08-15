import {
  AuthKitProvider,
  Impersonation,
} from "@workos-inc/authkit-nextjs/components";

const AppLayout = ({ children }: LayoutProps<"/">) => (
  <AuthKitProvider>
    <Impersonation />
    <main className="flex-1" id="main">
      {children}
    </main>
  </AuthKitProvider>
);

export default AppLayout;
