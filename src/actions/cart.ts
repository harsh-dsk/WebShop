"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { getEffectiveStock } from "@/lib/services/catalog.service";
import { getOrCreateCart } from "@/lib/services/cart.service";

export type ActionState = {
  error?: string;
  success?: boolean;
};

const CART_PATHS = [
  ROUTES.cart,
  ROUTES.checkout,
  ROUTES.home,
  ROUTES.products,
] as const;

function revalidateCartPaths() {
  revalidatePath(ROUTES.cart);
  revalidatePath(ROUTES.checkout);
  for (const path of CART_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/", "layout");
}

export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<ActionState> {
  const user = await requireUser();

  if (quantity < 1 || quantity > 99) {
    return { error: "Invalid quantity" };
  }

  const product = await db.product.findUnique({
    where: { id: productId, isActive: true },
    include: {
      variants: { where: { isActive: true }, select: { stock: true, isActive: true } },
    },
  });

  if (!product) {
    return { error: "Product not found" };
  }

  const stock = getEffectiveStock(product);
  if (stock <= 0) {
    return { error: "This product is out of stock" };
  }

  const cart = await getOrCreateCart(user.id);

  const existing = await db.cartItem.findUnique({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
  });

  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (newQuantity > stock) {
    return { error: `Only ${stock} available in stock` };
  }

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  revalidateCartPaths();
  return { success: true };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<ActionState> {
  const user = await requireUser();

  if (quantity < 1 || quantity > 99) {
    return { error: "Invalid quantity" };
  }

  const item = await db.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: { userId: user.id },
    },
    include: {
      product: {
        include: {
          variants: { where: { isActive: true }, select: { stock: true, isActive: true } },
        },
      },
    },
  });

  if (!item) {
    return { error: "Cart item not found" };
  }

  const stock = getEffectiveStock(item.product);
  if (quantity > stock) {
    return { error: `Only ${stock} available in stock` };
  }

  await db.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  revalidateCartPaths();
  return { success: true };
}

export async function removeFromCart(cartItemId: string): Promise<ActionState> {
  const user = await requireUser();

  const item = await db.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: { userId: user.id },
    },
  });

  if (!item) {
    return { error: "Cart item not found" };
  }

  await db.cartItem.delete({
    where: { id: cartItemId },
  });

  revalidateCartPaths();
  return { success: true };
}
