const AppLayout = ({ children }: LayoutProps<"/">) => (
  <main className="flex-1" id="main">
    {children}
  </main>
);

export default AppLayout;
