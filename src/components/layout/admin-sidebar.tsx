"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Package, ShoppingBag, Warehouse } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/routes";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.admin, label: "Overview", icon: LayoutDashboard },
  { href: ROUTES.adminProducts, label: "Products", icon: Package },
  { href: ROUTES.adminCategories, label: "Categories", icon: FolderTree },
  { href: ROUTES.adminInventory, label: "Inventory", icon: Warehouse },
  { href: ROUTES.adminOrders, label: "Orders", icon: ShoppingBag },
];

type AdminSidebarProps = {
  role?: Role | null;
};

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Store management
      </p>
      <nav
        className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible"
        aria-label="Admin navigation"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === ROUTES.admin
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "nav-link-sidebar",
                active ? "nav-link-sidebar-active" : "nav-link-sidebar-inactive",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      {role === "SUPER_ADMIN" && (
        <Link
          href={ROUTES.superAdmin}
          className="nav-link-sidebar nav-link-sidebar-inactive mt-4 border border-dashed border-border"
        >
          Super Admin CMS →
        </Link>
      )}
      <p className="mt-8 hidden px-1 text-xs leading-relaxed text-muted-foreground lg:block">
        {siteConfig.brand.name} — admin panel
      </p>
    </aside>
  );
}
