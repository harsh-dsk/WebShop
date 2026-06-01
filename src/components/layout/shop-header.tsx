import Link from "next/link";
import { Leaf } from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export async function ShopHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight text-primary">
            FreshMart
          </span>
        </Link>

        <UserMenu role={user?.role ?? null} />
      </div>
    </header>
  );
}
