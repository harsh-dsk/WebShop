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
        className="gap-2 w-full sm:w-auto"
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
      >
        <Heart className="h-4 w-4" aria-hidden />
        {pending ? "Updating…" : active ? "In wishlist" : "Add to wishlist"}
      </Button>
      {status && (
        <p
          className={`text-sm ${status.type === "success" ? "text-primary" : "text-red-600"}`}
          role="status"
        >
          {status.message}
        </p>
      )}
    </div>
  );
}

