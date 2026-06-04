"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  initialActive?: boolean;
  className?: string;
};

export function WishlistButton({
  productId,
  initialActive = false,
  className,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(initialActive);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant={active ? "accent" : "outline"}
        size="lg"
        className={cn(
          "gap-2 w-full sm:w-auto transition-all duration-200",
          active && "shadow-sm",
        )}
        disabled={pending}
        onClick={() => {
          setStatus(null);
          startTransition(async () => {
            const result = await toggleWishlist(productId);
            if (result.error) {
              setStatus({ type: "error", message: result.error });
              return;
            }

            setActive((current) => {
              const nextActive = !current;
              setStatus({
                type: "success",
                message: nextActive ? "Added to wishlist" : "Removed from wishlist",
              });
              return nextActive;
            });
          });
        }}
        aria-pressed={active}
      >
        <Heart
          className={cn("h-4 w-4 transition-transform duration-200", active && "fill-current scale-110")}
          aria-hidden
        />
        {pending ? "Updating…" : active ? "In wishlist" : "Add to wishlist"}
      </Button>
      {status && (
        <p
          className={cn(
            "text-sm animate-fade-in",
            status.type === "success" ? "text-primary" : "text-destructive",
          )}
          role="status"
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
