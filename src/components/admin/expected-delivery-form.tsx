"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateExpectedDeliveryDate } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  orderId: string;
  defaultValue?: Date | string | null;
};

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ExpectedDeliveryForm({ orderId, defaultValue }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const date = (form.elements.namedItem("expectedDeliveryDate") as HTMLInputElement).value;

        startTransition(async () => {
          const result = await updateExpectedDeliveryDate(orderId, date);
          if (result.error) {
            alert(result.error);
          } else {
            router.refresh();
          }
        });
      }}
    >
      <div>
        <Label htmlFor="expectedDeliveryDate">Expected delivery</Label>
        <Input
          id="expectedDeliveryDate"
          name="expectedDeliveryDate"
          type="date"
          defaultValue={toDateInputValue(defaultValue)}
          className="mt-1.5 min-w-[14rem]"
          disabled={pending}
          required
        />
      </div>
      <Button type="submit" loading={pending}>
        {pending ? "Saving…" : "Save date"}
      </Button>
    </form>
  );
}

