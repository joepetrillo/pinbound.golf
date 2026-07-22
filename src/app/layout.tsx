import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@wrksz/themes/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const title = "Pinbound Golf";
const description =
  "Pinbound is an AI phone assistant for golf courses. It answers pro shop calls with fast, consistent help — following your course's policies — so staff can stay with the golfers in front of them.";

export const metadata: Metadata = {
  description,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description,
    siteName: SITE_NAME,
    title,
    type: "website",
    url: SITE_URL,
  },
  title,
  twitter: {
    card: "summary_large_image",
    description,
    title,
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html
    lang="en"
    className={cn(
      "scroll-smooth",
      "antialiased",
      "font-sans",
      "bg-background",
      "overflow-y-scroll",
      geistMono.variable,
      geist.variable
    )}
    data-scroll-behavior="smooth"
    suppressHydrationWarning
  >
    <body>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableColorScheme={true}
        enableSystem
      >
        <div className="isolate flex min-h-dvh flex-col">{children}</div>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);

export default RootLayout;
