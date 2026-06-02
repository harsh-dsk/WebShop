import { OrderStatus, PaymentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { deductProductStock } from "@/lib/services/inventory.service";
import { getCartWithItems } from "@/lib/services/cart.service";
import type { CheckoutInput } from "@/lib/validations/checkout";

export async function generateOrderNumber(): Promise<string> {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 10; attempt++) {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderNumber = `ORD-${datePart}-${random}`;

    const existing = await db.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!existing) return orderNumber;
  }

  throw new Error("Could not generate a unique order number");
}

export async function placeCodOrder(userId: string, shipping: CheckoutInput) {
  const { cart, items } = await getCartWithItems(userId);

  if (items.length === 0) {
    throw new Error("Your cart is empty");
  }

  for (const item of items) {
    if (!item.isActive) {
      throw new Error(`${item.name} is no longer available`);
    }
    if (item.quantity > item.availableStock) {
      throw new Error(`Only ${item.availableStock} of ${item.name} available`);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;
  const orderNumber = await generateOrderNumber();

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingName: shipping.shippingName,
        shippingEmail: shipping.shippingEmail,
        shippingPhone: shipping.shippingPhone,
        shippingAddress: shipping.shippingAddress,
        shippingCity: shipping.shippingCity,
        shippingState: shipping.shippingState,
        shippingPostalCode: shipping.shippingPostalCode,
        shippingCountry: "IN",
        subtotal,
        shippingCost,
        tax,
        total,
        notes: "Cash on Delivery",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productSlug: item.slug,
            productImage: item.image?.url ?? null,
            unitPrice: item.price,
            quantity: item.quantity,
            lineTotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of items) {
      await deductProductStock(tx, item.productId, item.quantity);
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return created;
  });

  return order;
}

export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getUserOrderById(userId: string, orderId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: { slug: true, isActive: true },
          },
        },
      },
    },
  });
}

export async function getOrderByOrderNumber(userId: string, orderNumber: string) {
  return db.order.findFirst({
    where: { orderNumber, userId },
    include: { items: true },
  });
}

export async function getAllOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      _count: { select: { items: true } },
    },
  });
}

export async function getAdminOrderById(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      items: true,
    },
  });
}
