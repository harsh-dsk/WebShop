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
    <Card className="overflow-hidden transition hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {href && (
              <Link
                href={href}
                className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
              >
                {linkLabel} →
              </Link>
            )}
          </div>
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              variant === "default" && "bg-primary/10 text-primary",
              variant === "warning" && "bg-amber-100 text-amber-800",
              variant === "danger" && "bg-red-100 text-red-700",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
