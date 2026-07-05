import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const title = "Pinbound — golf course phone answering that follows your rules";
const description =
  "Pinbound answers every call to your pro shop, books tee times against your tee sheet, and enforces your booking policies. Callers can always reach a person. Built for golf course GMs.";

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
    className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    lang="en"
    suppressHydrationWarning
  >
    <body className="flex min-h-full flex-col">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
