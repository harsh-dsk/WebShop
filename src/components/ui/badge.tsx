import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "muted" | "warning" | "success" | "danger";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary/10 text-primary",
        variant === "accent" && "bg-accent/15 text-accent",
        variant === "muted" && "bg-muted text-muted-foreground",
        variant === "warning" && "bg-amber-100 text-amber-900",
        variant === "success" && "bg-emerald-100 text-emerald-900",
        variant === "danger" && "bg-red-100 text-red-800",
        className,
      )}
      {...props}
    />
  );
}
