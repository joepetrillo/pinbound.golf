// Single source of truth for sitewide copy, CTAs, and the founding-program
// scarcity counter. Update FOUNDING_SPOTS_CLAIMED as spots are taken.

export const SITE_NAME = "Pinbound";

export const SITE_URL = "https://pinbound-agent.vercel.app";

export const SITE_DESCRIPTION =
  "Pinbound answers your pro shop's phone, books tee times against your tee sheet, and follows your booking policies. Callers can always reach a person.";

export const CTA_LABEL = "Claim a Founding Spot";
export const CTA_HREF = "#founding";

export const DEMO_LABEL = "Hear the Demo";
export const DEMO_HREF = "#demo";

export const FOUNDING_SPOTS_TOTAL = 10;
export const FOUNDING_SPOTS_CLAIMED = 3;
export const FOUNDING_SPOTS_LEFT =
  FOUNDING_SPOTS_TOTAL - FOUNDING_SPOTS_CLAIMED;

export const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;
