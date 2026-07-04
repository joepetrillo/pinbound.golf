import Link from "next/link";
import { RiFlagLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const productLinks = [
  { label: "How It Works", href: "#how" },
  { label: "Live Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
] as const;

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Founding Course Program", href: "#" },
] as const;

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Recording & AI Disclosure", href: "#" },
] as const;

function FooterLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm">
        <RiFlagLine className="size-4" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-white">
        pinbound
      </span>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-white uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-zinc-950 py-16 text-zinc-400">
      <div className="mx-auto max-w-5xl px-5">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <FooterLogo />
            <p className="mt-4 text-sm text-zinc-400">
              Every call, answered.
            </p>
            <form className="mt-6 flex gap-2" action="#">
              <Input
                type="email"
                placeholder="you@yourcourse.com"
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
              />
              <Button
                type="submit"
                variant="secondary"
                className="shrink-0 bg-white text-zinc-950 hover:bg-zinc-200"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-3 text-xs text-zinc-500">
              Off-season reading for GMs. No spam.
            </p>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-zinc-800 pt-6 text-xs sm:flex-row sm:items-center">
          <span>© 2026 Pinbound · pinbound.golf</span>
          <span>Made in New England</span>
        </div>
      </div>
    </footer>
  );
}
