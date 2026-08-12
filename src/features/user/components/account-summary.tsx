import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOutAction } from "@/features/user/user-actions";
import { getSignedInUser } from "@/features/user/user-queries";
import { MARKETING_HOME_HREF } from "@/lib/site";

export const AccountSummary = async () => {
  const user = await getSignedInUser();

  return (
    <div className="mt-4">
      <p className="max-w-prose leading-relaxed text-pretty text-muted-foreground">
        Welcome back
        {user.firstName ? `, ${user.firstName}` : ""}.
      </p>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">
        {user.email}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link className={buttonVariants()} href={MARKETING_HOME_HREF}>
          Go back home
        </Link>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="cursor-pointer">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
};

export const AccountSummarySkeleton = () => (
  <div aria-hidden="true" className="mt-4">
    <Skeleton className="h-6 w-64 max-w-full rounded-full" />
    <Skeleton className="mt-2 h-5 w-48 max-w-full rounded-full" />
    <div className="mt-8 flex flex-wrap gap-3">
      <Skeleton className="h-9 w-28 rounded-lg" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);
