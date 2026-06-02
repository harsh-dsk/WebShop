"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStoreStaff, requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { placeCodOrder } from "@/lib/services/order.service";
import { parseCheckoutFormData } from "@/lib/validations/checkout";

export type ActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function placeOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = parseCheckoutFormData(formData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? "Please fix the form errors";
    return { error: firstError, fieldErrors };
  }

  let order;
  try {
    order = await placeCodOrder(user.id, parsed.data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not place your order";
    return { error: message };
  }

  revalidatePath(ROUTES.cart);
  revalidatePath(ROUTES.checkout);
  revalidatePath(ROUTES.accountOrders);
  revalidatePath(ROUTES.adminOrders);
  revalidatePath(ROUTES.home, "layout");

  redirect(`${ROUTES.checkoutSuccess}?orderNumber=${order.orderNumber}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ActionState> {
  await requireStoreStaff();

  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(status)) {
    return { error: "Invalid order status" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!order) {
    return { error: "Order not found" };
  }

  await db.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath(ROUTES.adminOrders);
  revalidatePath(`${ROUTES.adminOrders}/${orderId}`);
  revalidatePath(ROUTES.accountOrders);
  revalidatePath(`${ROUTES.accountOrders}/${orderId}`);

  return { success: true };
}
