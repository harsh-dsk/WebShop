import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getUserOrders } from "@/lib/services/order.service";

export const metadata: Metadata = {
  title: "My orders",
};

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-primary">My orders</h1>
      <p className="mt-2 text-muted-foreground">
        Track your Cash on Delivery orders.
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          You have not placed any orders yet.{" "}
          <Link href={ROUTES.products} className="text-primary hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`${ROUTES.accountOrders}/${order.id}`}
                className="block rounded-2xl border border-border bg-card p-6 transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                      {" · "}
                      {order._count.items} item
                      {order._count.items === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="mt-2 font-semibold text-primary">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
