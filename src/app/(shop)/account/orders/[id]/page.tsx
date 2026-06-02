import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { OrderTimeline } from "@/components/shop/order-timeline";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getUserOrderById } from "@/lib/services/order.service";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const order = await getUserOrderById(user.id, id);
  return {
    title: order ? `Order ${order.orderNumber}` : "Order not found",
  };
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const order = await getUserOrderById(user.id, id);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href={ROUTES.accountOrders} className="hover:text-primary">
          My orders
        </Link>
        <span className="mx-2">/</span>
        <span>{order.orderNumber}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Order details</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {order.orderNumber}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Shipping</h2>
          <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground">
            {order.shippingName}
            <br />
            {order.shippingAddress}
            <br />
            {order.shippingCity}
            {order.shippingState ? `, ${order.shippingState}` : ""}{" "}
            {order.shippingPostalCode}
            <br />
            {order.shippingPhone}
            <br />
            {order.shippingEmail}
          </address>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Placed</dt>
              <dd>
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(Number(order.subtotal))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatPrice(Number(order.shippingCost))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatPrice(Number(order.tax))}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt>Total</dt>
              <dd className="text-primary">{formatPrice(Number(order.total))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd>Cash on Delivery ({order.paymentStatus.toLowerCase()})</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-6">
        <OrderTimeline
          status={order.status}
          expectedDeliveryDate={order.expectedDeliveryDate}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`${ROUTES.products}/${item.productSlug}`}
                  className="font-medium hover:text-primary"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Qty {item.quantity} × {formatPrice(Number(item.unitPrice))}
                </p>
              </div>
              <p className="font-medium">{formatPrice(Number(item.lineTotal))}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
