// Single source of truth for sitewide copy and CTAs.

export const SITE_NAME = "Pinbound";

export const SITE_URL = "https://pinbound-agent.vercel.app";

export const SITE_DESCRIPTION =
  "Pinbound answers your pro shop's phone, books tee times against your tee sheet, and follows your booking policies. Callers can always reach a person.";

// One-sentence summary used in the footer.
export const SITE_TAGLINE =
  "The phone assistant that answers your pro shop's calls and books tee times around the clock.";

export const CTA_LABEL = "Claim a founding spot";
export const CTA_HREF = "/#pricing";

export const FOUNDERS_EMAIL = "founders@pinbound.golf";

export const DEMO_LABEL = "Try the demo";
export const DEMO_HREF = "/#demo";

// Order mirrors the page: product → demo → pricing → FAQ. Root-relative
// hashes so the links work from any page, not just the homepage.
export const NAV_LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#demo", label: "Demo" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const CONTACT_LABEL = "Contact";
export const CONTACT_HREF = "/contact";

export const GET_STARTED_LABEL = "Get started";
export const GET_STARTED_HREF = "/get-started";
