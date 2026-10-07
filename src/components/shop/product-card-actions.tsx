"use client";

import { useTransition } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/actions/cart";
import { toggleWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";

export function ProductCardActions({ productId, availableStock }: { productId: string, availableStock: number }) {
  const [pendingCart, startCart] = useTransition();
  const [pendingWishlist, startWishlist] = useTransition();

  return (
    <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" onClick={e => e.preventDefault()}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white text-foreground hover:text-primary transition-colors border-none"
        disabled={pendingWishlist}
        onClick={(e) => {
          e.preventDefault();
          startWishlist(async () => {
            const result = await toggleWishlist(productId);
            if (result.error) {
              toast.error(result.error);
            } else {
              toast.success("Wishlist updated");
            }
          });
        }}
      >
        <Heart className="h-4 w-4" />
      </Button>
      {availableStock > 0 && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white text-foreground hover:text-primary transition-colors border-none"
          disabled={pendingCart}
          onClick={(e) => {
            e.preventDefault();
            startCart(async () => {
              const result = await addToCart(productId, 1);
              if (result.error) {
                toast.error(result.error);
              } else {
                toast.success("Added to cart");
              }
            });
          }}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
