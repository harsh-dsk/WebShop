"use client";

import { useActionState, useState, useEffect } from "react";
import { MapPin, Package, Truck } from "lucide-react";

import { placeOrder, type ActionState } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
    <form action={formAction} className="space-y-6 lg:space-y-8">
      <div className="checkout-section animate-fade-in">
        <div className="checkout-section-header">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Shipping details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cash on Delivery — pay when your order arrives.
              </p>
            </div>
          </div>
        </div>

        <div className="checkout-section-body space-y-6">
          {previousOrder ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
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
              <MapPin className="h-4 w-4" aria-hidden />
              Use previous order address
            </button>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="shippingName" required className="sm:col-span-2">
              <Input
                id="shippingName"
                name="shippingName"
                required
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </FormField>
            <FormField label="Email" htmlFor="shippingEmail" required>
              <Input
                id="shippingEmail"
                name="shippingEmail"
                type="email"
                required
                value={shippingEmail}
                onChange={(e) => setShippingEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </FormField>
            <FormField label="Phone" htmlFor="shippingPhone" required>
              <Input
                id="shippingPhone"
                name="shippingPhone"
                type="tel"
                required
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                placeholder="+91 9876543210"
                autoComplete="tel"
              />
            </FormField>
            <FormField label="Address" htmlFor="shippingAddress" required className="sm:col-span-2">
              <Textarea
                id="shippingAddress"
                name="shippingAddress"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Street address, apartment, suite, etc."
                autoComplete="street-address"
              />
            </FormField>
            <FormField label="City" htmlFor="shippingCity" required>
              <Input
                id="shippingCity"
                name="shippingCity"
                required
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                placeholder="Enter city"
                autoComplete="address-level2"
              />
            </FormField>
            <FormField label="State" htmlFor="shippingState" required>
              <Input
                id="shippingState"
                name="shippingState"
                required
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
                placeholder="Enter state"
                autoComplete="address-level1"
              />
            </FormField>
            <FormField label="Postal code" htmlFor="shippingPostalCode" required className="sm:col-span-2 sm:max-w-xs">
              <Input
                id="shippingPostalCode"
                name="shippingPostalCode"
                required
                value={shippingPostalCode}
                onChange={(e) => setShippingPostalCode(e.target.value)}
                placeholder="000000"
                autoComplete="postal-code"
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className="checkout-section animate-fade-in lg:sticky lg:top-24">
        <div className="checkout-section-header">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Package className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review totals before placing your order.
              </p>
            </div>
          </div>
        </div>

        <div className="checkout-section-body">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium tabular-nums">{formatPrice(0)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="font-medium tabular-nums">{formatPrice(0)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-4 text-base">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="font-bold tabular-nums text-primary">{formatPrice(subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Payment method: Cash on Delivery
          </p>
        </div>
      </div>

      {state.error && (
        <p className="form-alert-error" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full sm:max-w-md" disabled={pending}>
        {pending ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
