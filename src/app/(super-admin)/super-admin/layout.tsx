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
      <Toaster position="top-center" richColors closeButton />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-md">
        <div className="page-container-wide flex h-14 flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              SA
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Super Admin</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {config.brand.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href={ROUTES.admin}
              className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Store admin →
            </Link>
            <Link
              href={ROUTES.home}
              className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Storefront →
            </Link>
          </div>
        </div>
      </header>

      <div className="page-container-wide flex flex-col gap-8 py-8 lg:flex-row lg:gap-10">
        <SuperAdminSidebar />
        <div className="min-w-0 flex-1 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
