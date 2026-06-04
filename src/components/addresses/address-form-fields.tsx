import type { AddressLabel } from "@prisma/client";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ADDRESS_LABEL_OPTIONS } from "@/lib/address-labels";
import type { SavedAddress } from "@/types/address";

type AddressFormFieldsProps = {
  address?: Partial<SavedAddress>;
  showDefaultCheckbox?: boolean;
};

export function AddressFormFields({
  address,
  showDefaultCheckbox = true,
}: AddressFormFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="label">Label</Label>
        <Select
          id="label"
          name="label"
          defaultValue={(address?.label as AddressLabel) ?? "HOME"}
          required
        >
          {ADDRESS_LABEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <FormField label="Full name" htmlFor="fullName" required className="sm:col-span-2">
        <Input
          id="fullName"
          name="fullName"
          required
          defaultValue={address?.fullName ?? ""}
          placeholder="Enter full name"
          autoComplete="name"
        />
      </FormField>

      <FormField label="Phone number" htmlFor="phone" required className="sm:col-span-2 sm:max-w-md">
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={address?.phone ?? ""}
          placeholder="+91 9876543210"
          autoComplete="tel"
        />
      </FormField>

      <FormField label="Address line" htmlFor="addressLine" required className="sm:col-span-2">
        <Textarea
          id="addressLine"
          name="addressLine"
          required
          rows={3}
          defaultValue={address?.addressLine ?? ""}
          placeholder="Street address, apartment, suite, etc."
          autoComplete="street-address"
        />
      </FormField>

      <FormField label="City" htmlFor="city" required>
        <Input
          id="city"
          name="city"
          required
          defaultValue={address?.city ?? ""}
          placeholder="City"
          autoComplete="address-level2"
        />
      </FormField>

      <FormField label="State" htmlFor="state" required>
        <Input
          id="state"
          name="state"
          required
          defaultValue={address?.state ?? ""}
          placeholder="State"
          autoComplete="address-level1"
        />
      </FormField>

      <FormField label="Postal code" htmlFor="postalCode" required>
        <Input
          id="postalCode"
          name="postalCode"
          required
          defaultValue={address?.postalCode ?? ""}
          placeholder="000000"
          autoComplete="postal-code"
        />
      </FormField>

      <FormField label="Country" htmlFor="country" required hint="2-letter ISO code (e.g. IN)">
        <Input
          id="country"
          name="country"
          required
          maxLength={2}
          defaultValue={address?.country ?? "IN"}
          placeholder="IN"
          autoComplete="country"
        />
      </FormField>

      {showDefaultCheckbox && (
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={address?.isDefault ?? false}
              className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            Set as default address
          </label>
        </div>
      )}
    </div>
  );
}
