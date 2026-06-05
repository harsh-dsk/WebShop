import Link from "next/link";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { PageTransition } from "@/components/providers/page-transition";
import { siteConfig } from "@/config/site";
import { requireStoreStaff } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStoreStaff();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-md">
        <div className="page-container-wide flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {siteConfig.logo.text}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {siteConfig.brand.name}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Store admin
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.home}
            className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            View storefront →
          </Link>
        </div>
      </header>

      <div className="page-container-wide flex flex-col gap-8 py-8 lg:flex-row lg:gap-10">
        <AdminSidebar role={user.role} />
        <div className="min-w-0 flex-1">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
