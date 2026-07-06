"use client";

import { RiCloseLine, RiFlagLine, RiMenuLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CTA_HREF, CTA_LABEL, NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

const Logo = ({ onClick }: { onClick?: () => void }) => (
  <Link className="flex items-center gap-2.5" href="/" onClick={onClick}>
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <RiFlagLine aria-hidden className="size-4" />
    </span>
    <span className="font-bold tracking-tight text-foreground">pinbound</span>
  </Link>
);

export const SiteHeader = () => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 0
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!(entry?.isIntersecting ?? true));
      },
      { threshold: 0 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none h-px w-full"
      />
      <header
        className={cn(
          "sticky top-0 z-50 transition-colors",
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
          <Logo />

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <Button nativeButton={false} render={<Link href={CTA_HREF} />}>
              {CTA_LABEL}
            </Button>
          </nav>

          <div className="md:hidden">
            <Drawer
              onOpenChange={setDrawerOpen}
              open={drawerOpen}
              swipeDirection="right"
            >
              <DrawerTrigger
                render={
                  <Button aria-label="Open menu" size="icon" variant="ghost" />
                }
              >
                <RiMenuLine className="size-5" />
              </DrawerTrigger>
              <DrawerContent className="flex h-full flex-col">
                <div className="flex shrink-0 items-center justify-between p-4">
                  <Logo
                    onClick={() => {
                      setDrawerOpen(false);
                    }}
                  />
                  <DrawerClose
                    render={
                      <Button
                        aria-label="Close menu"
                        size="icon"
                        variant="ghost"
                      />
                    }
                  >
                    <RiCloseLine className="size-5" />
                  </DrawerClose>
                  <DrawerTitle className="sr-only">Navigation menu</DrawerTitle>
                </div>

                <nav className="flex flex-1 flex-col px-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      className="py-3 text-base text-muted-foreground transition-colors hover:text-foreground"
                      href={link.href}
                      onClick={() => {
                        setDrawerOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto shrink-0">
                  <div className="border-t border-border px-4 py-4">
                    <Button
                      className="w-full"
                      nativeButton={false}
                      render={
                        <Link
                          href={CTA_HREF}
                          onClick={() => {
                            setDrawerOpen(false);
                          }}
                        />
                      }
                    >
                      {CTA_LABEL}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-t border-border px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      Appearance
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>
    </>
  );
};
