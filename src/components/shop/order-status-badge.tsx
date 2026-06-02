import type { OrderStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const statusVariant: Record<
  OrderStatus,
  "default" | "accent" | "muted" | "warning" | "success" | "danger"
> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PROCESSING: "accent",
  SHIPPED: "accent",
  DELIVERED: "success",
  CANCELLED: "danger",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
