"use client";

import { RiFlagLine, RiMenuLine } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "#how", label: "How It Works" },
  { href: "#demo", label: "Live Demo" },
  { href: "#rules", label: "Your Rules" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

function Logo() {
  return (
    <Link href="#" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm">
        <RiFlagLine className="size-4" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        pinbound
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="#pricing" />}
            className="hidden md:inline-flex"
          >
            Get a Free Pilot
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <RiMenuLine className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="px-4 pt-4">
                <Button
                  render={
                    <Link href="#pricing" onClick={() => setOpen(false)} />
                  }
                  className="w-full"
                >
                  Get a Free Pilot
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
