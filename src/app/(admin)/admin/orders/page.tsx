import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getAllOrders } from "@/lib/services/order.service";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Orders"
        description="Manage Cash on Delivery orders and fulfillment status."
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const customerName =
                [order.user.firstName, order.user.lastName]
                  .filter(Boolean)
                  .join(" ") || order.shippingName;

              return (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`${ROUTES.adminOrders}/${order.id}`}
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.shippingPhone}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
