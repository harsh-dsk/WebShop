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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary">My orders</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Track your Cash on Delivery orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-xl border-2 border-border bg-card/50 p-10 text-center shadow-sm">
          <p className="text-muted-foreground">
            You have not placed any orders yet.{" "}
            <Link href={ROUTES.products} className="font-medium text-primary hover:underline">
              Start shopping
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`${ROUTES.accountOrders}/${order.id}`}
                className="block rounded-xl border-2 border-border bg-card p-6 shadow-sm transition duration-200 hover:border-primary/50 hover:shadow-md hover:bg-card/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                      {" · "}
                      <span className="font-medium">{order._count.items}</span> item
                      {order._count.items === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="mt-2 text-lg font-bold text-primary">
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
