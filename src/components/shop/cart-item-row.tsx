"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { removeFromCart, updateCartItemQuantity } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

type CartItemRowProps = {
  item: {
    id: string;
    productId: string;
    name: string;
    slug: string;
    quantity: number;
    price: number;
    subtotal: number;
    image: { url: string; alt?: string } | null;
    availableStock: number;
  };
};

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(item.quantity);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  if (removed) return null;

  const subtotal = item.price * quantity;

  function handleQuantityChange(next: number) {
    const previous = quantity;
    setQuantity(next);

    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, next);
      if (result.error) {
        setQuantity(previous);
        toast.error(result.error);
        return;
      }
      toast.success("Quantity updated");
      router.refresh();
    });
  }

  function handleRemove() {
    setRemoved(true);

    startTransition(async () => {
      const result = await removeFromCart(item.id);
      if (result.error) {
        setRemoved(false);
        toast.error(result.error);
        return;
      }
      toast.success("Item removed from cart");
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "flex gap-4 py-6 transition-all duration-200 last:pb-0 sm:gap-5",
        pending && "opacity-70",
      )}
    >
      <Link
        href={`${ROUTES.products}/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-shadow hover:shadow-md sm:h-28 sm:w-28"
      >
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.image.alt ?? item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`${ROUTES.products}/${item.slug}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPrice(item.price)} each
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 px-0"
              disabled={pending || quantity <= 1}
              aria-busy={pending}
              onClick={() => handleQuantityChange(quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span
              className="w-8 text-center text-sm font-medium tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 px-0"
              disabled={pending || quantity >= item.availableStock}
              aria-busy={pending}
              onClick={() => handleQuantityChange(quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-semibold text-primary tabular-nums">
              {formatPrice(subtotal)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600"
              disabled={pending}
              aria-busy={pending}
              onClick={handleRemove}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
