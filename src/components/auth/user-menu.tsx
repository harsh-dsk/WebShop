"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import type { Role } from "@prisma/client";

type UserMenuProps = {
  role: Role | null;
};

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
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {displayName}
        {role === "ADMIN" && (
          <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            Admin
          </span>
        )}
      </span>
      <Link href={ROUTES.profile}>
        <Button variant="outline" size="sm">
          Profile
        </Button>
      </Link>
      {role === "ADMIN" && (
        <Link href={ROUTES.admin}>
          <Button variant="primary" size="sm">
            Admin
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
