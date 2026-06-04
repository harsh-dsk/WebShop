import type { AddressLabel } from "@prisma/client";

export const ADDRESS_LABEL_OPTIONS: { value: AddressLabel; label: string }[] = [
  { value: "HOME", label: "Home" },
  { value: "OFFICE", label: "Office" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "OTHER", label: "Other" },
];

export function formatAddressLabel(label: AddressLabel): string {
  return ADDRESS_LABEL_OPTIONS.find((o) => o.value === label)?.label ?? label;
}
