import { RiArrowRightLine, RiFlagLine } from "@remixicon/react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { CTA_HREF, CTA_LABEL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

interface FooterLink {
  href: string;
  label: string;
}

const indexLinks: readonly FooterLink[] = [
  { href: "/#product", label: "Product" },
  { href: "/#integrations", label: "Integrations" },
  { href: "/#demo", label: "Demo" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const Logo = () => (
  <Link className="inline-flex items-center gap-2.5 hover:opacity-90" href="/">
    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <RiFlagLine aria-hidden className="size-3.5" />
    </span>
    <span className="text-sm font-medium tracking-[0.12em] text-foreground uppercase">
      pinbound
    </span>
  </Link>
);

export const SiteFooter = () => (
  <footer className="@container w-full border-t bg-background" id="site-footer">
    <div className="px-6 pt-14 pb-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 @3xl:flex-row @3xl:items-start @3xl:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm text-balance text-muted-foreground">
            {SITE_TAGLINE}
          </p>
          <Link
            className={buttonVariants({
              className: "mt-6 text-xs tracking-[0.12em] uppercase",
              variant: "outline",
            })}
            href={CTA_HREF}
          >
            {CTA_LABEL}
            <RiArrowRightLine aria-hidden data-icon="inline-end" />
          </Link>
        </div>

        <nav aria-label="Footer" className="max-w-md">
          <ul className="flex flex-wrap gap-2 @3xl:justify-end">
            {indexLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className={buttonVariants({
                    className:
                      "text-xs tracking-[0.12em] text-muted-foreground uppercase",
                    size: "sm",
                    variant: "outline",
                  })}
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl pt-14">
        <div className="flex flex-wrap-reverse items-center justify-between gap-x-8 gap-y-6">
          <p className="text-sm text-balance text-muted-foreground">
            © 2026 {SITE_NAME} · All rights reserved
          </p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </footer>
);
