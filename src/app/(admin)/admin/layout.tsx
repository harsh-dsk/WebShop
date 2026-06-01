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
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-semibold text-primary">
            {siteConfig.brand.name} — Admin
          </span>
          <Link
            href={ROUTES.home}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← View store
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
