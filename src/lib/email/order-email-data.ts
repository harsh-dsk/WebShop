import type { Order, OrderItem, OrderStatus, User } from "@prisma/client";

import { formatPrice } from "@/lib/format";
import { getSiteBaseUrl } from "@/lib/email/config";
import type { OrderEmailData } from "@/lib/email/types";
import { ROUTES } from "@/lib/constants/routes";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function decimalToNumber(value: { toString(): string }): number {
  return Number(value.toString());
}

function formatDeliveryDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
  }).format(date);
}

function formatAddress(order: Order): string {
  const parts = [
    order.shippingAddress,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ].filter(Boolean);
  return parts.join(", ");
}

type OrderWithItems = Order & { items: OrderItem[] };

export function formatOrderStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

export function buildOrderEmailData(order: OrderWithItems): OrderEmailData {
  const baseUrl = getSiteBaseUrl();
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.shippingName,
    customerEmail: order.shippingEmail,
    customerPhone: order.shippingPhone,
    status: order.status,
    statusLabel: formatOrderStatusLabel(order.status),
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: formatPrice(decimalToNumber(item.unitPrice)),
      lineTotal: formatPrice(decimalToNumber(item.lineTotal)),
    })),
    subtotal: formatPrice(decimalToNumber(order.subtotal)),
    shippingCost: formatPrice(decimalToNumber(order.shippingCost)),
    tax: formatPrice(decimalToNumber(order.tax)),
    total: formatPrice(decimalToNumber(order.total)),
    expectedDeliveryDate: formatDeliveryDate(order.expectedDeliveryDate),
    shippingAddress: formatAddress(order),
    orderUrl: `${baseUrl}${ROUTES.accountOrders}/${order.id}`,
  };
}

export type AdminOrderEmailData = OrderEmailData & {
  accountEmail: string | null;
};

export function buildAdminOrderEmailData(
  order: OrderWithItems & {
    user?: Pick<User, "email" | "firstName" | "lastName" | "phone"> | null;
  },
): AdminOrderEmailData {
  const base = buildOrderEmailData(order);
  return {
    ...base,
    accountEmail: order.user?.email ?? null,
  };
}
