"use client";

import { useActionState } from "react";

import {
  createAddress,
  updateAddress,
  type AddressActionState,
} from "@/actions/addresses";
import { AddressFormFields } from "@/components/addresses/address-form-fields";
import { Button } from "@/components/ui/button";
import type { SavedAddress } from "@/types/address";

const initialState: AddressActionState = {};

type AddressFormProps = {
  mode: "create" | "edit";
  address?: SavedAddress;
  returnTo?: string;
};

export function AddressForm({ mode, address, returnTo }: AddressFormProps) {
  const [state, formAction, pending] = useActionState(
    mode === "create"
      ? createAddress
      : (prev: AddressActionState, formData: FormData) =>
          updateAddress(address!.id, prev, formData),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <AddressFormFields address={address} showDefaultCheckbox />

      {state.error && (
        <p className="form-alert-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Save address" : "Update address"}
        </Button>
      </div>
    </form>
  );
}
