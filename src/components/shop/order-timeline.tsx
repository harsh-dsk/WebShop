import type { OrderStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const STEPS: Array<{ id: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED"; label: string }> = [
  { id: "PENDING", label: "Order placed" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "PROCESSING", label: "Processing" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
];

function stepIndex(status: OrderStatus): number {
  const idx = STEPS.findIndex((s) => s.id === status);
  if (idx >= 0) return idx;
  // CANCELLED or unknown -> show only placed.
  return 0;
}

type Props = {
  status: OrderStatus;
  expectedDeliveryDate?: Date | string | null;
};

export function OrderTimeline({ status, expectedDeliveryDate }: Props) {
  const current = stepIndex(status);
  const cancelled = status === "CANCELLED";
  const eta =
    expectedDeliveryDate != null
      ? new Date(expectedDeliveryDate).toLocaleDateString(undefined, { dateStyle: "medium" })
      : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {cancelled
              ? "This order was cancelled."
              : eta
                ? `Estimated delivery: ${eta}`
                : "Estimated delivery date will appear here once confirmed."}
          </p>
        </div>
      </div>

      <ol className={cn("mt-6 grid gap-3 sm:grid-cols-5", cancelled && "opacity-60")}>
        {STEPS.map((step, idx) => {
          const done = idx <= current && !cancelled;
          const active = idx === current && !cancelled;

          return (
            <li key={step.id} className="flex items-center gap-3 sm:flex-col sm:items-start">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  active && "ring-2 ring-primary/20",
                )}
                aria-hidden
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

