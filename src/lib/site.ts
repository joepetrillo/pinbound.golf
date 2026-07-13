// Single source of truth for sitewide copy and CTAs.

export const SITE_NAME = "Pinbound";

export const SITE_URL = "https://pinbound.golf";

export const SITE_DESCRIPTION =
  "Pinbound answers your pro shop's phone, books tee times against your tee sheet, and follows your booking policies. Callers can always reach a person.";

// One-sentence summary used in the footer.
export const SITE_TAGLINE =
  "Fast, consistent help for callers. Fewer phone interruptions for your staff.";

export const CTA_LABEL = "Get started";
export const CTA_HREF = "/get-started";

export const FOUNDERS_EMAIL = "founders@pinbound.golf";

export const DEMO_LABEL = "Try the demo";
export const DEMO_HREF = "/#demo";

// The logo is the persistent route back to the homepage and its beginning, so
// the primary nav can focus on the three highest-intent sections plus the blog.
export const NAV_LINKS = [
  { href: "/#demo", label: "Demo" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
] as const;

export const CONTACT_LABEL = "Contact";
export const CONTACT_HREF = "/contact";

export const GET_STARTED_LABEL = "Get started";
export const GET_STARTED_HREF = "/get-started";
