import Image from "next/image";
import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { ShopMobileNav } from "@/components/layout/shop-mobile-nav";
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
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href={ROUTES.home}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            {logo.type === "image" && logo.imageUrl ? (
              <Image
                src={logo.imageUrl}
                alt={logo.imageAlt}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-contain"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                {logo.text}
              </span>
            )}
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {brand.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.main.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

        <ShopMobileNav links={navigation.main} />
      </div>
    </header>
  );
}
