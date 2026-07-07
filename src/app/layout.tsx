import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";

import { SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const title = "Pinbound Golf";
const description =
  "24/7 AI phone answering for golf courses, wired into your tee sheet — with a dashboard where you control exactly what it's allowed to do. For GMs and pro shops.";

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
    className={cn(
      "h-full",
      "scroll-smooth",
      "antialiased",
      geistMono.variable,
      "font-sans",
      geist.variable
    )}
    lang="en"
    suppressHydrationWarning
  >
    <body className="flex min-h-full flex-col">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
        enableColorScheme={true}
      >
        <div className="isolate">{children}</div>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
