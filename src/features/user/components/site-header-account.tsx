"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CTA_HREF, CTA_LABEL, DASHBOARD_HREF } from "@/lib/site";

const accountControlClassName = buttonVariants({
  className: "w-full md:h-8 md:w-24",
});

export const SiteHeaderAccount = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <Skeleton
        aria-hidden="true"
        className="h-9 w-full rounded-4xl md:h-8 md:w-24"
      />
    );
  }

  if (!user) {
    return (
      <a className={accountControlClassName} href={CTA_HREF}>
        {CTA_LABEL}
      </a>
    );
  }

  return (
    <Link className={accountControlClassName} href={DASHBOARD_HREF}>
      Dashboard
    </Link>
  );
};
