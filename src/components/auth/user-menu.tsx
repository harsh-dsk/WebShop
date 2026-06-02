"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import type { Role } from "@prisma/client";

type UserMenuProps = {
  role: Role | null;
};

function isStoreStaff(role: Role | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function UserMenu({ role }: UserMenuProps) {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href={ROUTES.signIn}>
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href={ROUTES.signUp}>
          <Button variant="accent" size="sm">
            Sign up
          </Button>
        </Link>
      </div>
    );
  }

  const displayName =
    user.fullName ?? user.firstName ?? user.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden max-w-[8rem] truncate text-sm text-muted-foreground sm:inline">
        {displayName}
        {role === "SUPER_ADMIN" && (
          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
            Dev
          </span>
        )}
        {role === "ADMIN" && (
          <span className="ml-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-xs text-accent">
            Admin
          </span>
        )}
      </span>
      <Link href={ROUTES.profile}>
        <Button variant="outline" size="sm">
          Profile
        </Button>
      </Link>
      <Link href={ROUTES.accountOrders}>
        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
          Orders
        </Button>
      </Link>
      {isStoreStaff(role) && (
        <Link href={ROUTES.admin}>
          <Button variant="primary" size="sm">
            Dashboard
          </Button>
        </Link>
      )}
      <SignOutButton>
        <Button variant="ghost" size="sm">
          Sign out
        </Button>
      </SignOutButton>
    </div>
  );
}
