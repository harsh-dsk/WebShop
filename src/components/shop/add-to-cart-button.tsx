"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";

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
  const [message, setMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(initialQuantity);

  const canAddMore = quantity < availableStock;
  const buttonLabel = pending
    ? "Adding…"
    : quantity > 0
    ? `Add another (${quantity} in cart)`
    : "Add to cart";

  return (
    <div className="space-y-2 w-full sm:w-auto">
      <Button
        type="button"
        variant="accent"
        size="lg"
        className="w-full sm:w-auto"
        disabled={disabled || pending || !canAddMore}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await addToCart(productId, 1);
            if (result.error) {
              setMessage(result.error);
            } else {
              setQuantity((current) => Math.min(current + 1, availableStock));
              setMessage("Added to cart");
            }
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
      {message && (
        <p
          className={`text-sm ${message === "Added to cart" ? "text-primary" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      )}
      {!canAddMore && !disabled && (
        <p className="text-sm text-red-600">You already have the maximum available quantity in your cart.</p>
      )}
    </div>
  );
}
