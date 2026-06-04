"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddressLabel } from "@/lib/address-labels";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/types/address";

export type CheckoutShippingFields = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
};

type AddressSelectorProps = {
  addresses: SavedAddress[];
  defaultEmail: string;
  initialFields: CheckoutShippingFields & { shippingEmail?: string };
  onSelect: (fields: CheckoutShippingFields & { shippingEmail: string }) => void;
};

function addressToShipping(
  address: SavedAddress,
  email: string,
): CheckoutShippingFields & { shippingEmail: string } {
  return {
    shippingName: address.fullName,
    shippingEmail: email,
    shippingPhone: address.phone,
    shippingAddress: address.addressLine,
    shippingCity: address.city,
    shippingState: address.state,
    shippingPostalCode: address.postalCode,
  };
}

export function AddressSelector({
  addresses,
  defaultEmail,
  initialFields,
  onSelect,
}: AddressSelectorProps) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedId, setSelectedId] = useState<string | "manual">(
    defaultAddress?.id ?? "manual",
  );

  function handleSelect(address: SavedAddress) {
    setSelectedId(address.id);
    onSelect(addressToShipping(address, defaultEmail));
  }

  function handleManual() {
    setSelectedId("manual");
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          No saved addresses yet. Enter your details below or add an address to your
          book.
        </p>
        <Link
          href={`${ROUTES.accountAddresses}/new?returnTo=${encodeURIComponent(ROUTES.checkout)}`}
          className="mt-3 inline-block"
        >
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" aria-hidden />
            Add address
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Saved addresses</p>
        <Link
          href={`${ROUTES.accountAddresses}/new?returnTo=${encodeURIComponent(ROUTES.checkout)}`}
        >
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add new
          </Button>
        </Link>
      </div>

      <div
        className="space-y-2"
        role="radiogroup"
        aria-label="Select delivery address"
      >
        {addresses.map((address) => {
          const selected = selectedId === address.id;
          return (
            <div
              key={address.id}
              className={cn(
                "relative rounded-lg border transition-all duration-200",
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30",
              )}
            >
              <label className="flex cursor-pointer items-start gap-3 p-4">
                <input
                  type="radio"
                  name="savedAddress"
                  className="mt-1 h-4 w-4 border-border text-primary focus-visible:ring-ring/30"
                  checked={selected}
                  onChange={() => handleSelect(address)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {formatAddressLabel(address.label)}
                    </span>
                    {address.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {address.fullName} · {address.phone}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground line-clamp-2">
                    {address.addressLine}, {address.city}, {address.state}{" "}
                    {address.postalCode}
                  </span>
                </span>
              </label>
              {selected && (
                <div className="border-t border-border px-4 py-2">
                  <Link
                    href={`${ROUTES.accountAddresses}/${address.id}/edit?returnTo=${encodeURIComponent(ROUTES.checkout)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    <Pencil className="h-3 w-3" aria-hidden />
                    Edit this address
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all duration-200",
            selectedId === "manual"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border bg-card hover:border-primary/30",
          )}
        >
          <input
            type="radio"
            name="savedAddress"
            className="h-4 w-4 border-border text-primary"
            checked={selectedId === "manual"}
            onChange={() => {
              handleManual();
              onSelect({
                shippingName: initialFields.shippingName,
                shippingEmail: initialFields.shippingEmail ?? defaultEmail,
                shippingPhone: initialFields.shippingPhone,
                shippingAddress: initialFields.shippingAddress,
                shippingCity: initialFields.shippingCity,
                shippingState: initialFields.shippingState,
                shippingPostalCode: initialFields.shippingPostalCode,
              });
            }}
          />
          <span className="text-sm font-medium text-foreground">
            <MapPin className="mr-1.5 inline h-4 w-4 text-muted-foreground" aria-hidden />
            Enter a different address
          </span>
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        <Link href={ROUTES.accountAddresses} className="font-medium text-accent hover:underline">
          Manage address book
        </Link>
      </p>
    </div>
  );
}
