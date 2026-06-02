import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getAdminOrderById } from "@/lib/services/order.service";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  const customerName =
    [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
    order.shippingName;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description="Review order details and update fulfillment status."
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="rounded-2xl border border-border bg-card p-6">
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Customer</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{order.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{order.shippingPhone}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Shipping address</h2>
          <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground">
            {order.shippingName}
            <br />
            {order.shippingAddress}
            <br />
            {order.shippingCity}
            {order.shippingState ? `, ${order.shippingState}` : ""}{" "}
            {order.shippingPostalCode}
          </address>
          <p className="mt-4 text-xs text-muted-foreground">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Qty {item.quantity} × {formatPrice(Number(item.unitPrice))}
                </p>
              </div>
              <p className="font-medium">{formatPrice(Number(item.lineTotal))}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(Number(order.subtotal))}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd className="text-primary">{formatPrice(Number(order.total))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment</dt>
            <dd>
              COD · {order.paymentStatus.toLowerCase()}
            </dd>
          </div>
        </dl>
      </section>

      <Link
        href={ROUTES.adminOrders}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to orders
      </Link>
    </div>
  );
}
