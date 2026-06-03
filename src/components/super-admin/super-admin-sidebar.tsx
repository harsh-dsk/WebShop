"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Palette,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.superAdmin, label: "Overview", icon: LayoutDashboard },
  { href: ROUTES.superAdminUsers, label: "Users", icon: Users },
  { href: ROUTES.superAdminSettings, label: "Settings", icon: Settings },
  { href: ROUTES.superAdminBranding, label: "Branding", icon: Sparkles },
  { href: ROUTES.superAdminTheme, label: "Theme", icon: Palette },
  { href: ROUTES.superAdminAnalytics, label: "Analytics", icon: BarChart3 },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Platform control
      </p>
      <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === ROUTES.superAdmin
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
    </aside>
  );
}
