import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string | number;
  href?: string;
  linkLabel?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger";
};

export function StatsCard({
  label,
  value,
  href,
  linkLabel = "View",
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:border-primary/15 hover:shadow-elevated">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            {href && (
              <Link
                href={href}
                className="mt-3 inline-flex text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-accent/90 hover:underline"
              >
                {linkLabel} →
              </Link>
            )}
          </div>
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
              variant === "default" && "bg-primary/10 text-primary",
              variant === "warning" && "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
              variant === "danger" && "bg-red-50 text-red-700 ring-1 ring-red-200",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
