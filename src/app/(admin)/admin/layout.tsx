import Link from "next/link";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { siteConfig } from "@/config/site";
import { requireStoreStaff } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStoreStaff();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              {siteConfig.logo.text}
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">
                {siteConfig.brand.name}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Store admin
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.home}
            className="text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            View storefront →
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-12">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
