"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
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
  { href: ROUTES.superAdminActivity, label: "Activity", icon: Activity },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Platform control
      </p>
      <nav
        className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible"
        aria-label="Super admin navigation"
      >
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
    </aside>
  );
}
