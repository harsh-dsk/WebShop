"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant={active ? "accent" : "outline"}
        size="lg"
        className={cn(
          "w-full gap-2 transition-all duration-200 sm:w-auto",
          active && "shadow-sm",
        )}
        loading={pending}
        onClick={() => {
          const nextActive = !active;
          setActive(nextActive);

          startTransition(async () => {
            const result = await toggleWishlist(productId);
            if (result.error) {
              setActive(!nextActive);
              toast.error(result.error);
              return;
            }
            toast.success(
              nextActive ? "Added to wishlist" : "Removed from wishlist",
            );
          });
        }}
        aria-pressed={active}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            active && "scale-110 fill-current",
          )}
          aria-hidden
        />
        {pending ? "Updating…" : active ? "In wishlist" : "Add to wishlist"}
      </Button>
    </div>
  );
}
