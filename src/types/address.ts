import type { AddressLabel } from "@prisma/client";

/** Serializable address for client components */
export type SavedAddress = {
  id: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressFormInput = Omit<SavedAddress, "id" | "isDefault"> & {
  isDefault?: boolean;
};
