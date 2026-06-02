"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Package, ShoppingBag, Warehouse } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.admin, label: "Overview", icon: LayoutDashboard },
  { href: ROUTES.adminProducts, label: "Products", icon: Package },
  { href: ROUTES.adminCategories, label: "Categories", icon: FolderTree },
  { href: ROUTES.adminInventory, label: "Inventory", icon: Warehouse },
  { href: ROUTES.adminOrders, label: "Orders", icon: ShoppingBag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Store management
      </p>
      <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
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
                "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-8 hidden text-xs text-muted-foreground lg:block">
        {siteConfig.brand.name} — admin panel
      </p>
    </aside>
  );
}
