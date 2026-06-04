import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[108px] w-full resize-y rounded-lg border border-border bg-card px-3.5 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/80",
      "hover:border-primary/20",
      "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
      "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
