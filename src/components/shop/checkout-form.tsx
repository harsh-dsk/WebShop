"use client";

import { useActionState } from "react";

import { placeOrder, type ActionState } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";

const initialState: ActionState = {};

type CheckoutFormProps = {
  subtotal: number;
  defaults?: {
    shippingName?: string;
    shippingEmail?: string;
    shippingPhone?: string;
  };
};

export function CheckoutForm({ subtotal, defaults }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Shipping details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cash on Delivery — pay when your order arrives.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="shippingName">Full name</Label>
            <Input
              id="shippingName"
              name="shippingName"
              required
              defaultValue={defaults?.shippingName}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="shippingEmail">Email</Label>
            <Input
              id="shippingEmail"
              name="shippingEmail"
              type="email"
              required
              defaultValue={defaults?.shippingEmail}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="shippingPhone">Phone</Label>
            <Input
              id="shippingPhone"
              name="shippingPhone"
              type="tel"
              required
              defaultValue={defaults?.shippingPhone}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shippingAddress">Address</Label>
            <Textarea
              id="shippingAddress"
              name="shippingAddress"
              required
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="shippingCity">City</Label>
            <Input id="shippingCity" name="shippingCity" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="shippingState">State</Label>
            <Input id="shippingState" name="shippingState" required className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shippingPostalCode">Postal code</Label>
            <Input
              id="shippingPostalCode"
              name="shippingPostalCode"
              required
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{formatPrice(0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd>{formatPrice(0)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="text-primary">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Payment method: Cash on Delivery</p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
