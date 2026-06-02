"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";

import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-2">
      <Button
        type="button"
        variant="accent"
        size="lg"
        className="w-full sm:w-auto"
        disabled={disabled || pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await addToCart(productId, 1);
            if (result.error) {
              setMessage(result.error);
            } else {
              setMessage("Added to cart");
            }
          });
        }}
      >
        <ShoppingCart className="mr-2 h-5 w-5" aria-hidden />
        {pending ? "Adding…" : "Add to cart"}
      </Button>
      {message && (
        <p
          className={`text-sm ${message === "Added to cart" ? "text-primary" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
