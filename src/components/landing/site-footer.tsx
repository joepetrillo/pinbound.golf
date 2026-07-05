import { RiFlagLine } from "@remixicon/react";
import Link from "next/link";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

interface FooterColumnProps {
  links: readonly FooterLink[];
  title: string;
}

interface FooterLink {
  href: string;
  label: string;
}

const companyLinks: readonly FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
];

const legalLinks: readonly FooterLink[] = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/security", label: "Security" },
  { href: "/terms", label: "Terms of service" },
];

const productLinks: readonly FooterLink[] = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#product", label: "Product" },
  { href: "#faq", label: "FAQ" },
];

const Logo = () => (
  <Link className="flex items-center gap-2.5" href="#">
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <RiFlagLine aria-hidden className="size-4" />
    </span>
    <span className="font-bold tracking-tight text-foreground">pinbound</span>
  </Link>
);

const FooterColumn = ({ links, title }: FooterColumnProps) => (
  <div>
    <h3 className="text-sm font-medium text-foreground">{title}</h3>
    <ul className="mt-4 space-y-3">
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
  <footer className="border-t border-border bg-background py-12">
    <div className="mx-auto w-full max-w-5xl px-5">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {SITE_DESCRIPTION}
          </p>
        </div>

        <FooterColumn links={productLinks} title="Product" />
        <FooterColumn links={companyLinks} title="Company" />
        <FooterColumn links={legalLinks} title="Legal" />
      </div>

      <div className="mt-10 space-y-4 border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">
          {SITE_NAME} always identifies itself to callers as your course&apos;s
          virtual assistant.
        </p>
        <p className="text-sm text-muted-foreground">© 2026 {SITE_NAME}</p>
      </div>
    </div>
  </footer>
);
