"use client";

import { useActionState, useCallback, useState } from "react";
import { Package, Truck } from "lucide-react";

import { placeOrder, type ActionState } from "@/actions/orders";
import {
  AddressSelector,
  type CheckoutShippingFields,
} from "@/components/addresses/address-selector";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import type { SavedAddress } from "@/types/address";

const initialState: ActionState = {};

type CheckoutFormProps = {
  subtotal: number;
  savedAddresses: SavedAddress[];
  defaults: CheckoutShippingFields & { shippingEmail: string };
};

export function CheckoutForm({ subtotal, savedAddresses, defaults }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  const [shippingName, setShippingName] = useState(defaults.shippingName);
  const [shippingEmail, setShippingEmail] = useState(defaults.shippingEmail);
  const [shippingPhone, setShippingPhone] = useState(defaults.shippingPhone);
  const [shippingAddress, setShippingAddress] = useState(defaults.shippingAddress);
  const [shippingCity, setShippingCity] = useState(defaults.shippingCity);
  const [shippingState, setShippingState] = useState(defaults.shippingState);
  const [shippingPostalCode, setShippingPostalCode] = useState(defaults.shippingPostalCode);

  const applyShipping = useCallback((fields: CheckoutShippingFields & { shippingEmail: string }) => {
    setShippingName(fields.shippingName);
    setShippingEmail(fields.shippingEmail);
    setShippingPhone(fields.shippingPhone);
    setShippingAddress(fields.shippingAddress);
    setShippingCity(fields.shippingCity);
    setShippingState(fields.shippingState);
    setShippingPostalCode(fields.shippingPostalCode);
  }, []);

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
          <AddressSelector
            addresses={savedAddresses}
            defaultEmail={defaults.shippingEmail}
            initialFields={{
              shippingName,
              shippingPhone,
              shippingAddress,
              shippingCity,
              shippingState,
              shippingPostalCode,
              shippingEmail,
            }}
            onSelect={applyShipping}
          />

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
