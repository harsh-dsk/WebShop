import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/shop/checkout-form";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { listUserAddresses } from "@/lib/services/address.service";
import { getCartWithItems } from "@/lib/services/cart.service";

export const metadata: Metadata = {
  title: "Checkout",
};

function buildCheckoutDefaults(
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  },
  savedAddresses: Awaited<ReturnType<typeof listUserAddresses>>,
) {
  const profileName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.fullName || "";

  const defaultAddress =
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  if (defaultAddress) {
    return {
      shippingName: defaultAddress.fullName,
      shippingEmail: user.email,
      shippingPhone: defaultAddress.phone,
      shippingAddress: defaultAddress.addressLine,
      shippingCity: defaultAddress.city,
      shippingState: defaultAddress.state,
      shippingPostalCode: defaultAddress.postalCode,
    };
  }

  return {
    shippingName: profileName,
    shippingEmail: user.email,
    shippingPhone: user.phone ?? "",
    shippingAddress: user.address ?? "",
    shippingCity: user.city ?? "",
    shippingState: user.state ?? "",
    shippingPostalCode: user.postalCode ?? "",
  };
}

export default async function CheckoutPage() {
  const user = await requireUser();
  const [{ items, subtotal }, savedAddresses] = await Promise.all([
    getCartWithItems(user.id),
    listUserAddresses(user.id),
  ]);

  if (items.length === 0) {
    redirect(ROUTES.cart);
  }

  const defaults = buildCheckoutDefaults(user, savedAddresses);

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
          Select a saved address or enter shipping details for your Cash on Delivery order.
        </p>
      </header>

      <div className="mt-8 lg:mt-10">
        <CheckoutForm
          subtotal={subtotal}
          savedAddresses={savedAddresses}
          defaults={defaults}
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
