"use client";

import { RiCloseLine, RiFlagLine, RiMenuLine } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  CONTACT_HREF,
  CONTACT_LABEL,
  GET_STARTED_HREF,
  GET_STARTED_LABEL,
  NAV_LINKS,
} from "@/lib/site";

const Logo = ({ onClick }: { onClick?: () => void }) => (
  <Link
    aria-label="Homepage"
    className="relative top-px inline-flex items-center gap-2.5"
    href="/"
    onClick={onClick}
  >
    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <RiFlagLine aria-hidden className="size-3.5" />
    </span>
    <span className="text-sm font-semibold tracking-[0.12em] text-foreground uppercase">
      pinbound
    </span>
  </Link>
);

const DesktopNav = () => (
  <nav
    aria-label="Primary"
    className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
  >
    <ul className="flex items-center">
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            href={link.href}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full bg-background px-4 md:px-6"
      id="site-header"
    >
      <div className="relative mx-auto grid h-site-header max-w-6xl grid-cols-[1fr_auto] items-center lg:grid-cols-[auto_1fr_auto]">
        <div className="col-start-1 row-start-1">
          <Logo />
        </div>

        <DesktopNav />

        <div className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end lg:col-start-3">
          <div className="hidden items-center gap-2 lg:flex">
            <Button
              nativeButton={false}
              render={<Link href={CONTACT_HREF} />}
              size="sm"
              variant="outline"
            >
              {CONTACT_LABEL}
            </Button>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90"
              nativeButton={false}
              render={<Link href={GET_STARTED_HREF} />}
              size="sm"
            >
              {GET_STARTED_LABEL}
            </Button>
          </div>

          <Drawer onOpenChange={setMenuOpen} open={menuOpen} showSwipeHandle>
            <DrawerTrigger
              className="lg:hidden"
              render={
                <Button
                  aria-label="Open navigation"
                  size="icon"
                  variant="ghost"
                />
              }
            >
              <RiMenuLine className="size-5" />
            </DrawerTrigger>

            <DrawerContent
              className="max-h-[85dvh] rounded-t-3xl"
              overlayClassName="supports-backdrop-filter:backdrop-blur-md"
            >
              <div className="flex max-h-[85dvh] flex-col px-4 pb-6 md:px-6">
                <div className="flex shrink-0 items-center justify-between py-4">
                  <Logo onClick={closeMenu} />
                  <DrawerClose
                    className="-mr-1"
                    render={
                      <Button
                        aria-label="Close navigation"
                        size="icon"
                        variant="ghost"
                      />
                    }
                  >
                    <RiCloseLine className="size-5" />
                  </DrawerClose>
                  <DrawerTitle className="sr-only">Navigation menu</DrawerTitle>
                </div>

                <nav aria-label="Primary" className="flex-1 overflow-y-auto">
                  <ul>
                    {NAV_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          className="block py-3 text-lg text-foreground transition-colors hover:text-muted-foreground"
                          href={link.href}
                          onClick={closeMenu}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-3">
                    <Button
                      className="w-full"
                      nativeButton={false}
                      render={<Link href={CONTACT_HREF} onClick={closeMenu} />}
                      variant="outline"
                    >
                      {CONTACT_LABEL}
                    </Button>
                    <Button
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                      nativeButton={false}
                      render={
                        <Link href={GET_STARTED_HREF} onClick={closeMenu} />
                      }
                    >
                      {GET_STARTED_LABEL}
                    </Button>
                  </div>
                </nav>

                <div className="flex shrink-0 items-center justify-between pt-6">
                  <span className="text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
};
