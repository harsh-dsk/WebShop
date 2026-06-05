"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getActionRateLimitError } from "@/lib/rate-limit-action";
import { ROUTES } from "@/lib/constants/routes";
import {
  createUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  updateUserAddress,
} from "@/lib/services/address.service";
import { parseAddressFormData } from "@/lib/validations/address";

export type AddressActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

const ADDRESS_PATHS = [
  ROUTES.accountAddresses,
  ROUTES.checkout,
  ROUTES.profile,
] as const;

function revalidateAddressPaths() {
  for (const path of ADDRESS_PATHS) {
    revalidatePath(path);
  }
  revalidatePath(ROUTES.home, "layout");
}

function redirectAfterSave(returnTo: string | null) {
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    redirect(returnTo);
  }
  redirect(ROUTES.accountAddresses);
}

export async function createAddress(
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const rateError = await getActionRateLimitError("address");
  if (rateError) return { error: rateError };

  const user = await requireUser();
  const parsed = parseAddressFormData(formData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Please fix the form errors";
    return { error: firstError, fieldErrors };
  }

  try {
    await createUserAddress(user.id, parsed.data);
  } catch {
    return { error: "Could not save address. Please try again." };
  }

  revalidateAddressPaths();
  redirectAfterSave(formData.get("returnTo")?.toString() ?? null);
  return { success: true };
}

export async function updateAddress(
  addressId: string,
  _prev: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const rateError = await getActionRateLimitError("address");
  if (rateError) return { error: rateError };

  const user = await requireUser();
  const parsed = parseAddressFormData(formData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Please fix the form errors";
    return { error: firstError, fieldErrors };
  }

  const updated = await updateUserAddress(user.id, addressId, parsed.data);
  if (!updated) {
    return { error: "Address not found" };
  }

  revalidateAddressPaths();
  redirectAfterSave(formData.get("returnTo")?.toString() ?? null);
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<AddressActionState> {
  const rateError = await getActionRateLimitError("address");
  if (rateError) return { error: rateError };

  const user = await requireUser();
  const deleted = await deleteUserAddress(user.id, addressId);

  if (!deleted) {
    return { error: "Address not found" };
  }

  revalidateAddressPaths();
  return { success: true };
}

export async function setDefaultAddress(addressId: string): Promise<AddressActionState> {
  const rateError = await getActionRateLimitError("address");
  if (rateError) return { error: rateError };

  const user = await requireUser();
  const updated = await setDefaultUserAddress(user.id, addressId);

  if (!updated) {
    return { error: "Address not found" };
  }

  revalidateAddressPaths();
  return { success: true };
}
