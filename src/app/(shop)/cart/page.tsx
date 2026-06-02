import type { Metadata } from "next";
import Link from "next/link";

import { CartItemRow } from "@/components/shop/cart-item-row";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-primary">Your cart</h1>
      <p className="mt-2 text-muted-foreground">
        {itemCount === 0
          ? "Your cart is empty."
          : `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`}
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Add products to get started.</p>
          <Link href={ROUTES.products} className="mt-6 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ul className="lg:col-span-2 rounded-2xl border border-border bg-card px-6">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
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
