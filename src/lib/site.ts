import type { Route } from "next";

export const SITE_NAME = "Pinbound";

export const SITE_URL = "https://pinbound.golf";
export const MARKETING_HOME_HREF = "/home" satisfies Route;

export const APP_HREF = "/app" satisfies Route;
export const DASHBOARD_HREF = "/app/dashboard" satisfies Route;

export const SITE_DESCRIPTION =
  "Pinbound answers your pro shop's phone, books tee times against your tee sheet, and follows your booking policies. Callers can always reach a person.";

export const SITE_TAGLINE =
  "Fast, consistent help for callers. Fewer phone interruptions for your staff.";

export const CTA_LABEL = "Get started";
export const CTA_HREF = "/auth/sign-up" satisfies Route;

export const CONTACT_EMAIL = "support@pinbound.golf";

export const DEMO_LABEL = "Try the demo";
export const DEMO_HREF = `${MARKETING_HOME_HREF}#demo` satisfies Route;

// The logo handles home navigation, leaving the nav for high-intent destinations.
export const NAV_LINKS = [
  { href: `${MARKETING_HOME_HREF}#demo`, label: "Demo" },
  { href: `${MARKETING_HOME_HREF}#pricing`, label: "Pricing" },
  { href: `${MARKETING_HOME_HREF}#faq`, label: "FAQ" },
  { href: "/blog", label: "Blog" },
] as const satisfies readonly { href: Route; label: string }[];

export const CONTACT_LABEL = "Contact";
export const CONTACT_HREF = "/contact" satisfies Route;
