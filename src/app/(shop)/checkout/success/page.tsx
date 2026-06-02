import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getOrderByOrderNumber } from "@/lib/services/order.service";

export const metadata: Metadata = {
  title: "Order placed",
};

type PageProps = {
  searchParams: Promise<{ orderNumber?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const { orderNumber } = await searchParams;

  if (!orderNumber) {
    redirect(ROUTES.accountOrders);
  }

  const order = await getOrderByOrderNumber(user.id, orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
          ✓
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary sm:text-3xl">
          Order placed successfully
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you! Your Cash on Delivery order has been received.
        </p>

        <dl className="mt-8 space-y-3 rounded-xl bg-muted/40 p-6 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-mono font-medium">{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <OrderStatusBadge status={order.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-semibold text-primary">
              {formatPrice(Number(order.total))}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payment</dt>
            <dd>Cash on Delivery</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`${ROUTES.accountOrders}/${order.id}`}>
            <Button className="w-full sm:w-auto">View order details</Button>
          </Link>
          <Link href={ROUTES.products}>
            <Button variant="outline" className="w-full sm:w-auto">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
