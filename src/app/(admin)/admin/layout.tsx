import Link from "next/link";
import { Leaf, Shield } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-semibold text-primary">FreshMart Admin</span>
          </div>
          <Link
            href={ROUTES.home}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Leaf className="h-4 w-4" aria-hidden />
            Back to store
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
