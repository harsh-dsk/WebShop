"use client";

import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateOrderStatus } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const status = (form.elements.namedItem("status") as HTMLSelectElement).value as OrderStatus;

        startTransition(async () => {
          const result = await updateOrderStatus(orderId, status);
          if (result.error) {
            alert(result.error);
          } else {
            router.refresh();
          }
        });
      }}
    >
      <div>
        <Label htmlFor="status">Order status</Label>
        <Select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="mt-1.5 min-w-[12rem]"
          disabled={pending}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update status"}
      </Button>
    </form>
  );
}
