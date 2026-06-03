import Link from "next/link";
import { Toaster } from "sonner";

import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar";
import { requireSuperAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { getRuntimeSiteConfig } from "@/lib/services/site-settings.service";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();
  const config = await getRuntimeSiteConfig();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              SA
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">Super Admin</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {config.brand.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={ROUTES.admin}
              className="font-medium text-muted-foreground transition hover:text-primary"
            >
              Store admin →
            </Link>
            <Link
              href={ROUTES.home}
              className="font-medium text-muted-foreground transition hover:text-primary"
            >
              Storefront →
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-12">
        <SuperAdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
