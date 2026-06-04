import type { Prisma, User, UserAddress } from "@prisma/client";

import { db } from "@/lib/db";
import type { AddressInput } from "@/lib/validations/address";
import type { SavedAddress } from "@/types/address";

export function toSavedAddress(address: UserAddress): SavedAddress {
  return {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    addressLine: address.addressLine,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

async function clearDefaultForUser(
  tx: Prisma.TransactionClient,
  userId: string,
  exceptId?: string,
) {
  await tx.userAddress.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
}

/** Import profile or latest order address when the user has no saved addresses yet. */
export async function syncLegacyAddresses(userId: string): Promise<void> {
  const count = await db.userAddress.count({ where: { userId } });
  if (count > 0) return;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const fromProfile = buildAddressFromUserProfile(user);
  if (fromProfile) {
    await db.userAddress.create({
      data: { userId, ...fromProfile, isDefault: true },
    });
    return;
  }

  const latestOrder = await db.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      shippingName: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingState: true,
      shippingPostalCode: true,
      shippingCountry: true,
    },
  });

  if (!latestOrder?.shippingAddress) return;

  await db.userAddress.create({
    data: {
      userId,
      label: "HOME",
      fullName: latestOrder.shippingName,
      phone: latestOrder.shippingPhone,
      addressLine: latestOrder.shippingAddress,
      city: latestOrder.shippingCity,
      state: latestOrder.shippingState ?? "",
      postalCode: latestOrder.shippingPostalCode,
      country: latestOrder.shippingCountry ?? "IN",
      isDefault: true,
    },
  });
}

function buildAddressFromUserProfile(
  user: Pick<
    User,
    | "fullName"
    | "firstName"
    | "lastName"
    | "phone"
    | "address"
    | "city"
    | "state"
    | "postalCode"
  >,
): Omit<Prisma.UserAddressCreateInput, "user" | "userId"> | null {
  if (!user.address?.trim() || !user.city?.trim() || !user.postalCode?.trim()) {
    return null;
  }

  const fullName =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  if (!fullName || !user.phone?.trim()) return null;

  return {
    label: "HOME",
    fullName,
    phone: user.phone.trim(),
    addressLine: user.address.trim(),
    city: user.city.trim(),
    state: user.state?.trim() ?? "",
    postalCode: user.postalCode.trim(),
    country: "IN",
  };
}

export async function listUserAddresses(userId: string): Promise<SavedAddress[]> {
  await syncLegacyAddresses(userId);

  const rows = await db.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return rows.map(toSavedAddress);
}

export async function getUserAddressById(userId: string, addressId: string) {
  return db.userAddress.findFirst({
    where: { id: addressId, userId },
  });
}

export async function createUserAddress(userId: string, input: AddressInput) {
  return db.$transaction(async (tx) => {
    const existingCount = await tx.userAddress.count({ where: { userId } });
    const shouldBeDefault = input.isDefault === true || existingCount === 0;

    if (shouldBeDefault) {
      await clearDefaultForUser(tx, userId);
    }

    const created = await tx.userAddress.create({
      data: {
        userId,
        label: input.label,
        fullName: input.fullName,
        phone: input.phone,
        addressLine: input.addressLine,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country ?? "IN",
        isDefault: shouldBeDefault,
      },
    });

    return toSavedAddress(created);
  });
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  input: AddressInput,
) {
  const existing = await getUserAddressById(userId, addressId);
  if (!existing) return null;

  return db.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await clearDefaultForUser(tx, userId, addressId);
    }

    const updated = await tx.userAddress.update({
      where: { id: addressId },
      data: {
        label: input.label,
        fullName: input.fullName,
        phone: input.phone,
        addressLine: input.addressLine,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country ?? "IN",
        ...(input.isDefault === true ? { isDefault: true } : {}),
      },
    });

    return toSavedAddress(updated);
  });
}

export async function deleteUserAddress(userId: string, addressId: string) {
  const existing = await getUserAddressById(userId, addressId);
  if (!existing) return false;

  await db.$transaction(async (tx) => {
    await tx.userAddress.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const next = await tx.userAddress.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
      if (next) {
        await tx.userAddress.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return true;
}

export async function setDefaultUserAddress(userId: string, addressId: string) {
  const existing = await getUserAddressById(userId, addressId);
  if (!existing) return null;

  return db.$transaction(async (tx) => {
    await clearDefaultForUser(tx, userId);
    const updated = await tx.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
    return toSavedAddress(updated);
  });
}
