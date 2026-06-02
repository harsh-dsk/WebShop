"use client";

import { Heart } from "lucide-react";
import { useTransition } from "react";

import { toggleWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  className?: string;
};

export function WishlistButton({ productId, className }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (result.error) alert(result.error);
        });
      }}
    >
      <Heart className="h-4 w-4" aria-hidden />
      Wishlist
    </Button>
  );
}

