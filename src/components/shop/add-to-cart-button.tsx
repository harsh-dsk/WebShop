"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  productId: string;
  availableStock: number;
  initialQuantity?: number;
  disabled?: boolean;
};

export function AddToCartButton({
  productId,
  availableStock,
  initialQuantity = 0,
  disabled,
}: AddToCartButtonProps) {
  const [pending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(initialQuantity);

  const canAddMore = quantity < availableStock;
  const buttonLabel = pending
    ? "Adding…"
    : quantity > 0
      ? `Add another (${quantity} in cart)`
      : "Add to cart";

  return (
    <div className="w-full space-y-2 sm:w-auto">
      <Button
        type="button"
        variant="accent"
        size="lg"
        className="w-full sm:w-auto"
        loading={pending}
        disabled={disabled || !canAddMore}
        onClick={() => {
          const previousQuantity = quantity;
          setQuantity((current) => Math.min(current + 1, availableStock));

          startTransition(async () => {
            const result = await addToCart(productId, 1);
            if (result.error) {
              setQuantity(previousQuantity);
              toast.error(result.error);
              return;
            }
            toast.success("Added to cart");
          });
        }}
      >
        <ShoppingCart className="mr-2 h-5 w-5" aria-hidden />
        {buttonLabel}
      </Button>
      {quantity > 0 && (
        <p className="text-sm text-muted-foreground">
          {quantity} item{quantity === 1 ? "" : "s"} currently in your cart.
        </p>
      )}
      {!canAddMore && !disabled && (
        <p className="text-sm text-red-600" role="status">
          You already have the maximum available quantity in your cart.
        </p>
      )}
    </div>
  );
}
