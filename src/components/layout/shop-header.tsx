import Image from "next/image";
import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { CartNavLink } from "@/components/shop/cart-nav-link";
import { getCurrentUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { getRuntimeSiteConfig } from "@/lib/services/site-settings.service";

export async function ShopHeader() {
  const [user, config] = await Promise.all([
    getCurrentUser(),
    getRuntimeSiteConfig(),
  ]);
  const { brand, logo, navigation } = config;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2">
          {logo.type === "image" && logo.imageUrl ? (
            <Image
              src={logo.imageUrl}
              alt={logo.imageAlt}
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              {logo.text}
            </span>
          )}
          <span className="text-lg font-semibold tracking-tight text-primary">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navigation.main.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CartNavLink userId={user?.id ?? null} />
          <UserMenu role={user?.role ?? null} />
        </div>
      </div>
    </header>
  );
}
