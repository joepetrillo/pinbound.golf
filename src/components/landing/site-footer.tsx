import { RiFlagLine } from "@remixicon/react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

interface FooterColumnProps {
  links: readonly FooterLink[];
  title: string;
}

interface FooterLink {
  href: string;
  label: string;
}

const productLinks: readonly FooterLink[] = [
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Integrations" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
];

const resourcesLinks: readonly FooterLink[] = [
  { href: "#faq", label: "FAQ" },
  { href: "/get-started", label: "Get started" },
];

const companyLinks: readonly FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks: readonly FooterLink[] = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/security", label: "Security" },
  { href: "/terms", label: "Terms of service" },
];

const Logo = () => (
  <Link className="inline-flex items-center gap-2.5 hover:opacity-90" href="/">
    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <RiFlagLine aria-hidden className="size-3.5" />
    </span>
    <span className="text-sm font-semibold tracking-[0.12em] text-foreground uppercase">
      pinbound
    </span>
  </Link>
);

const FooterColumn = ({ links, title }: FooterColumnProps) => (
  <div>
    <h3 className="mb-3 text-sm font-medium text-foreground">{title}</h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            href={link.href}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export const SiteFooter = () => (
  <footer className="@container w-full border-t bg-background" id="site-footer">
    <div className="px-6 py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 @2xl:grid-cols-4 @4xl:grid-cols-6">
        <div className="col-span-full @4xl:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-balance text-muted-foreground">
            {SITE_DESCRIPTION}
          </p>
        </div>

        <FooterColumn links={productLinks} title="Product" />
        <FooterColumn links={companyLinks} title="Company" />
        <FooterColumn links={resourcesLinks} title="Resources" />
        <FooterColumn links={legalLinks} title="Legal" />
      </div>

      <div className="mx-auto mt-14 max-w-6xl">
        <div className="flex flex-wrap-reverse items-center justify-between gap-x-8 gap-y-6">
          <p className="text-sm text-balance text-muted-foreground">
            © 2026 {SITE_NAME}. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </footer>
);
