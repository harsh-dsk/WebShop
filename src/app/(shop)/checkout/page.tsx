import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/shop/checkout-form";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { getCartWithItems } from "@/lib/services/cart.service";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await requireUser();
  const { items, subtotal } = await getCartWithItems(user.id);

  if (items.length === 0) {
    redirect(ROUTES.cart);
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.fullName || undefined;
  const latestOrder = await db.order.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shippingName: true,
      shippingEmail: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingState: true,
      shippingPostalCode: true,
    },
  });

  return (
    <div className="page-container-narrow py-10 sm:py-12 lg:max-w-4xl">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href={ROUTES.cart}>Cart</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Checkout</span>
      </nav>

      <header className="page-header mt-6">
        <h1 className="page-title text-balance">Checkout</h1>
        <p className="page-description">
          Complete your details to place a Cash on Delivery order.
        </p>
      </header>

      <div className="mt-8 lg:mt-10">
        <CheckoutForm
          subtotal={subtotal}
          defaults={{
            shippingName: fullName,
            shippingEmail: user.email,
            shippingPhone: user.phone ?? undefined,
            shippingAddress: user.address ?? undefined,
            shippingCity: user.city ?? undefined,
            shippingState: user.state ?? undefined,
            shippingPostalCode: user.postalCode ?? undefined,
          }}
          previousOrder={latestOrder ?? undefined}
        />
      </div>

      <div className="mt-8">
        <Link href={ROUTES.cart}>
          <Button variant="outline">Back to cart</Button>
        </Link>
      </div>
    </div>
  );
}
