"use client";

import { RiCloseLine, RiFlagLine, RiMenuLine } from "@remixicon/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
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
  MARKETING_HOME_HREF,
  NAV_LINKS,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const DESKTOP_HEADER_MEDIA_QUERY = "(min-width: 768px)";

const Logo = ({ onClick }: { onClick?: () => void }) => (
  <Link
    aria-label="Homepage"
    className="relative top-px inline-flex items-center gap-2.5 transition-opacity duration-150 ease-[ease] hover:opacity-80"
    href={MARKETING_HOME_HREF}
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
    className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
  >
    <ul className="flex items-center">
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            className={cn(buttonVariants({ variant: "ghost" }))}
            href={link.href}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export const SiteHeader = ({
  accountControl,
}: {
  accountControl: ReactNode;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Bumped on Activity hide so the drawer remounts closed — setOpen(false)
  // alone still plays the exit animation when the tree becomes visible again.
  const [drawerEpoch, setDrawerEpoch] = useState(0);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia(DESKTOP_HEADER_MEDIA_QUERY);
    const closeMenuOnDesktop = () => {
      if (desktopMediaQuery.matches) {
        setMenuOpen(false);
      }
    };

    closeMenuOnDesktop();
    desktopMediaQuery.addEventListener("change", closeMenuOnDesktop);

    return () => {
      desktopMediaQuery.removeEventListener("change", closeMenuOnDesktop);
    };
  }, []);

  // Soft navigations hide this header via Activity. Remount closed so
  // returning never restores an open drawer mid-exit animation.
  useLayoutEffect(
    () => () => {
      setMenuOpen(false);
      setDrawerEpoch((epoch) => epoch + 1);
    },
    []
  );

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full bg-background px-4 md:px-6"
      id="site-header"
    >
      <div className="relative mx-auto grid h-site-header max-w-6xl grid-cols-[1fr_auto] items-center md:grid-cols-[auto_1fr_auto]">
        <div className="col-start-1 row-start-1">
          <Logo />
        </div>

        <DesktopNav />

        <div className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end md:col-start-3">
          <div className="hidden items-center gap-2 md:flex">
            <Link
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              href={CONTACT_HREF}
            >
              {CONTACT_LABEL}
            </Link>
          </div>

          <div className="hidden md:block">{accountControl}</div>

          <Drawer
            key={drawerEpoch}
            onOpenChange={setMenuOpen}
            open={menuOpen}
            showSwipeHandle
          >
            <DrawerTrigger
              className="md:hidden"
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
              className="max-h-[85dvh] rounded-t-4xl"
              initialFocus={menuCloseRef}
              overlayClassName="supports-backdrop-filter:backdrop-blur-md"
            >
              <div className="flex max-h-[85dvh] flex-col px-4 pb-6 md:px-6">
                <div className="flex shrink-0 items-center justify-between py-4">
                  <Logo onClick={closeMenu} />
                  <DrawerClose
                    ref={menuCloseRef}
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

                <nav
                  aria-label="Primary"
                  className="flex-1 overflow-y-auto p-0.5"
                >
                  <ul>
                    {NAV_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          className="inline-block py-3 text-lg text-foreground transition-colors hover:text-muted-foreground"
                          href={link.href}
                          onClick={closeMenu}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-3">
                    <Link
                      className={cn(
                        buttonVariants({
                          className: "w-full",
                          variant: "outline",
                        })
                      )}
                      href={CONTACT_HREF}
                      onClick={closeMenu}
                    >
                      {CONTACT_LABEL}
                    </Link>
                    {accountControl}
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
