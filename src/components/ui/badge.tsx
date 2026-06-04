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
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        variant === "default" && "bg-primary/10 text-primary ring-primary/20",
        variant === "accent" && "bg-accent/10 text-accent ring-accent/20",
        variant === "muted" && "bg-muted text-muted-foreground ring-border",
        variant === "warning" && "bg-amber-50 text-amber-900 ring-amber-200",
        variant === "success" && "bg-emerald-50 text-emerald-800 ring-emerald-200",
        variant === "danger" && "bg-red-50 text-red-800 ring-red-200",
        className,
      )}
      {...props}
    />
  );
}
