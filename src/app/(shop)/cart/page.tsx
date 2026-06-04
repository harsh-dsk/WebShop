import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartItemRow } from "@/components/shop/cart-item-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getCartWithItems } from "@/lib/services/cart.service";

export const metadata: Metadata = {
  title: "Cart",
};

export default async function CartPage() {
  const user = await requireUser();
  const { items, subtotal, itemCount } = await getCartWithItems(user.id);

  return (
    <div className="page-container py-10 sm:py-12">
      <header className="page-header">
        <h1 className="page-title">Your cart</h1>
        <p className="page-description">
          {itemCount === 0
            ? "Your cart is empty."
            : `${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse our catalog and add products you love."
            action={
              <Link href={ROUTES.products}>
                <Button>Browse products</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
          <ul className="lg:col-span-2 surface-card divide-y divide-border px-4 sm:px-6">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>

          <aside className="surface-elevated h-fit p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Shipping and tax calculated at checkout.
            </p>
            <Link href={ROUTES.checkout} className="mt-6 block">
              <Button className="w-full" size="lg">
                Proceed to checkout
              </Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
