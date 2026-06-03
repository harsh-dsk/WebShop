"use client";

import { useActionState, useState, useEffect } from "react";

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
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingPostalCode?: string;
  };
  previousOrder?: {
    id: string;
    shippingName?: string | null;
    shippingEmail?: string | null;
    shippingPhone?: string | null;
    shippingAddress?: string | null;
    shippingCity?: string | null;
    shippingState?: string | null;
    shippingPostalCode?: string | null;
  };
};

export function CheckoutForm({ subtotal, defaults, previousOrder }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  const [shippingName, setShippingName] = useState(defaults?.shippingName ?? "");
  const [shippingEmail, setShippingEmail] = useState(defaults?.shippingEmail ?? "");
  const [shippingPhone, setShippingPhone] = useState(defaults?.shippingPhone ?? "");
  const [shippingAddress, setShippingAddress] = useState(defaults?.shippingAddress ?? "");
  const [shippingCity, setShippingCity] = useState(defaults?.shippingCity ?? "");
  const [shippingState, setShippingState] = useState(defaults?.shippingState ?? "");
  const [shippingPostalCode, setShippingPostalCode] = useState(defaults?.shippingPostalCode ?? "");

  useEffect(() => {
    setShippingName(defaults?.shippingName ?? "");
    setShippingEmail(defaults?.shippingEmail ?? "");
    setShippingPhone(defaults?.shippingPhone ?? "");
    setShippingAddress(defaults?.shippingAddress ?? "");
    setShippingCity(defaults?.shippingCity ?? "");
    setShippingState(defaults?.shippingState ?? "");
    setShippingPostalCode(defaults?.shippingPostalCode ?? "");
  }, [defaults]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Shipping details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cash on Delivery — pay when your order arrives.
            </p>
          </div>
        </div>

        {previousOrder ? (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              onClick={() => {
                setShippingName(previousOrder.shippingName ?? "");
                setShippingEmail(previousOrder.shippingEmail ?? "");
                setShippingPhone(previousOrder.shippingPhone ?? "");
                setShippingAddress(previousOrder.shippingAddress ?? "");
                setShippingCity(previousOrder.shippingCity ?? "");
                setShippingState(previousOrder.shippingState ?? "");
                setShippingPostalCode(previousOrder.shippingPostalCode ?? "");
              }}
            >
              ← Use previous order address
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="shippingName" className="block mb-2">
              Full name
            </Label>
            <Input
              id="shippingName"
              name="shippingName"
              required
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="shippingEmail" className="block mb-2">
              Email
            </Label>
            <Input
              id="shippingEmail"
              name="shippingEmail"
              type="email"
              required
              value={shippingEmail}
              onChange={(e) => setShippingEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="shippingPhone" className="block mb-2">
              Phone
            </Label>
            <Input
              id="shippingPhone"
              name="shippingPhone"
              type="tel"
              required
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shippingAddress" className="block mb-2">
              Address
            </Label>
            <Textarea
              id="shippingAddress"
              name="shippingAddress"
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
              placeholder="Street address, apartment, suite, etc."
            />
          </div>
          <div>
            <Label htmlFor="shippingCity" className="block mb-2">
              City
            </Label>
            <Input
              id="shippingCity"
              name="shippingCity"
              required
              value={shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div>
            <Label htmlFor="shippingState" className="block mb-2">
              State
            </Label>
            <Input
              id="shippingState"
              name="shippingState"
              required
              value={shippingState}
              onChange={(e) => setShippingState(e.target.value)}
              placeholder="Enter state"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shippingPostalCode" className="block mb-2">
              Postal code
            </Label>
            <Input
              id="shippingPostalCode"
              name="shippingPostalCode"
              required
              value={shippingPostalCode}
              onChange={(e) => setShippingPostalCode(e.target.value)}
              placeholder="000000"
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
