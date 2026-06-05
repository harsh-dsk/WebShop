"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ActivityAction,
  ActivityEntityType,
} from "@/lib/activity-log/actions";
import {
  revalidateActivitySummaryCache,
  revalidateAnalyticsCache,
  revalidateCatalogCache,
} from "@/lib/revalidate-cache";
import { requireStoreStaff, requireUser } from "@/lib/auth";
import { getActionRateLimitError } from "@/lib/rate-limit-action";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { logActivityForActor } from "@/lib/services/activity-log.service";
import { restoreProductStock } from "@/lib/services/inventory.service";
import {
  queueOrderPlacedEmails,
  queueOrderStatusEmail,
} from "@/lib/services/email.service";
import { placeCodOrder } from "@/lib/services/order.service";
import { parseCheckoutFormData } from "@/lib/validations/checkout";
import { expectedDeliverySchema } from "@/lib/validations/delivery";

export type ActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function placeOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rateError = await getActionRateLimitError("checkout");
  if (rateError) return { error: rateError };

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

  queueOrderPlacedEmails(order.id);

  await logActivityForActor(user, {
    action: ActivityAction.ORDER_PLACED,
    entityType: ActivityEntityType.ORDER,
    entityId: order.id,
    details: {
      orderNumber: order.orderNumber,
      total: Number(order.total),
    },
  });

  revalidateAnalyticsCache();
  revalidateCatalogCache();
  revalidateActivitySummaryCache();
  revalidatePath(ROUTES.cart);
  revalidatePath(ROUTES.superAdminActivity);
  revalidatePath(ROUTES.checkout);
  revalidatePath(ROUTES.accountAddresses);
  revalidatePath(ROUTES.accountOrders);
  revalidatePath(ROUTES.adminOrders);
  revalidatePath(ROUTES.home, "layout");

  redirect(`${ROUTES.checkoutSuccess}?orderNumber=${order.orderNumber}`);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ActionState> {
  const actor = await requireStoreStaff();

  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(status)) {
    return { error: "Invalid order status" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, orderNumber: true },
  });

  if (!order) {
    return { error: "Order not found" };
  }

  const previousStatus = order.status;
  if (previousStatus === status) {
    return { success: true };
  }

  // If transitioning to CANCELLED from a non-cancelled status, restore inventory.
  await db.$transaction(async (tx) => {
    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, quantity: true },
      });

      for (const item of items) {
        await restoreProductStock(tx, item.productId, item.quantity);
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status },
    });
  });

  revalidateAnalyticsCache();
  revalidateCatalogCache();
  revalidateActivitySummaryCache();
  revalidatePath(ROUTES.adminOrders);
  revalidatePath(`${ROUTES.adminOrders}/${orderId}`);
  revalidatePath(ROUTES.accountOrders);
  revalidatePath(`${ROUTES.accountOrders}/${orderId}`);

  queueOrderStatusEmail(orderId, status);

  const isCancellation = status === OrderStatus.CANCELLED;
  await logActivityForActor(actor, {
    action: isCancellation
      ? ActivityAction.ORDER_CANCELLED
      : ActivityAction.ORDER_STATUS_CHANGED,
    entityType: ActivityEntityType.ORDER,
    entityId: orderId,
    details: {
      orderNumber: order.orderNumber,
      previousStatus,
      newStatus: status,
    },
  });

  revalidatePath(ROUTES.superAdminActivity);

  return { success: true };
}

export async function updateExpectedDeliveryDate(
  orderId: string,
  expectedDeliveryDate: string,
): Promise<ActionState> {
  await requireStoreStaff();

  const parsed = expectedDeliverySchema.safeParse({ expectedDeliveryDate });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid date" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  if (!order) return { error: "Order not found" };

  await db.order.update({
    where: { id: orderId },
    data: { expectedDeliveryDate: new Date(parsed.data.expectedDeliveryDate) },
  });

  revalidatePath(`${ROUTES.adminOrders}/${orderId}`);
  revalidatePath(`${ROUTES.accountOrders}/${orderId}`);

  return { success: true };
}
