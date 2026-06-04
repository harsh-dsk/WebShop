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
      <nav className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Link href={ROUTES.accountOrders} className="transition hover:text-primary">
          My orders
        </Link>
        <span className="mx-3">/</span>
        <span className="text-foreground">{order.orderNumber}</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">Order details</h1>
          <p className="mt-2 font-mono text-sm font-medium text-muted-foreground">
            {order.orderNumber}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Shipping</h2>
          <address className="mt-4 not-italic space-y-1 text-sm leading-relaxed text-foreground">
            <p className="font-medium">{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}
              {order.shippingState ? `, ${order.shippingState}` : ""}{" "}
              {order.shippingPostalCode}
            </p>
            <p className="pt-2">{order.shippingPhone}</p>
            <p>{order.shippingEmail}</p>
          </address>
        </section>

        <section className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Placed</dt>
              <dd className="font-medium text-foreground">
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{formatPrice(Number(order.subtotal))}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium text-foreground">{formatPrice(Number(order.shippingCost))}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="font-medium text-foreground">{formatPrice(Number(order.tax))}</dd>
            </div>
            <div className="flex items-center justify-between border-t-2 border-border pt-3 font-semibold">
              <dt>Total</dt>
              <dd className="text-lg text-primary">{formatPrice(Number(order.total))}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="rounded-lg bg-accent/10 px-3 py-1 font-medium text-accent">Cash on Delivery</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-8 rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <OrderTimeline
          status={order.status}
          expectedDeliveryDate={order.expectedDeliveryDate}
        />
      </div>

      <section className="mt-8 rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Items</h2>
        <ul className="mt-4 divide-y-2 divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
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
                  className="font-semibold text-foreground hover:text-primary transition"
                >
                  {item.productName}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  Qty <span className="font-medium">{item.quantity}</span> × {formatPrice(Number(item.unitPrice))}
                </p>
              </div>
              <p className="text-right font-semibold text-primary">{formatPrice(Number(item.lineTotal))}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
