"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { getOrCreateWishlist } from "@/lib/services/wishlist.service";

export type ActionState = { error?: string; success?: boolean };

export async function toggleWishlist(productId: string): Promise<ActionState> {
  const user = await requireUser();
  const wishlist = await getOrCreateWishlist(user.id);

  const existing = await db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    select: { id: true },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await db.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
  }

  revalidatePath(ROUTES.wishlist);
  revalidatePath(ROUTES.products);
  revalidatePath(ROUTES.home);
  return { success: true };
}

export async function removeFromWishlist(
  wishlistItemId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const wishlist = await getOrCreateWishlist(user.id);

  const existing = await db.wishlistItem.findFirst({
    where: { id: wishlistItemId, wishlistId: wishlist.id },
    select: { id: true },
  });

  if (!existing) return;

  await db.wishlistItem.delete({ where: { id: wishlistItemId } });
  revalidatePath(ROUTES.wishlist);
}

