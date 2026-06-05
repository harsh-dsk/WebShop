import { db } from "@/lib/db";
import {
  getEffectiveStock,
  getPrimaryImage,
  parseProductImages,
} from "@/lib/catalog.utils";
export async function getOrCreateCart(userId: string) {
  const existing = await db.cart.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return db.cart.create({
    data: { userId },
  });
}

export async function getCartWithItems(userId: string) {
  const cart = await getOrCreateCart(userId);

  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        include: {
          variants: { where: { isActive: true }, select: { stock: true, isActive: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const lineItems = items.map((item) => {
    const price = Number(item.product.price);
    const images = parseProductImages(item.product.images);
    const primary = getPrimaryImage(images) ?? images[0];
    const subtotal = price * item.quantity;
    const availableStock = getEffectiveStock(item.product);

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      slug: item.product.slug,
      price,
      image: primary,
      subtotal,
      availableStock,
      isActive: item.product.isActive,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    cart,
    items: lineItems,
    subtotal,
    itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function getCartItemCount(userId: string): Promise<number> {
  const result = await db.cartItem.aggregate({
    where: { cart: { userId } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export async function getCartItemByProduct(userId: string, productId: string) {
  const item = await db.cartItem.findFirst({
    where: {
      productId,
      cart: { userId },
    },
    select: {
      id: true,
      quantity: true,
    },
  });

  return item ?? null;
}

export type CartLineItem = Awaited<ReturnType<typeof getCartWithItems>>["items"][number];
