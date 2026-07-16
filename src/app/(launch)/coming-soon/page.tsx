import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: `Coming Soon — ${SITE_NAME}`,
};

const ComingSoonPage = () => (
  <main
    className="flex min-h-dvh flex-col items-center justify-center gap-1 px-6 text-center"
    id="main"
  >
    <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
      Coming Soon
    </h1>
    <p className="mt-4 max-w-prose leading-relaxed text-pretty text-muted-foreground">
      Pinbound Golf
    </p>
  </main>
);

export default ComingSoonPage;
