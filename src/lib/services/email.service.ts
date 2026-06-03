import {
  EmailNotificationType,
  OrderStatus,
  Prisma,
} from "@prisma/client";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { AdminNewOrderEmail } from "@/emails/admin-new-order";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { OrderStatusEmail } from "@/emails/order-status";
import {
  getAdminEmail,
  getFromEmail,
  getResendApiKey,
  isEmailConfigured,
} from "@/lib/email/config";
import { emailLogger } from "@/lib/email/logger";
import {
  buildAdminOrderEmailData,
  buildOrderEmailData,
} from "@/lib/email/order-email-data";
import { db } from "@/lib/db";
import { getAdminOrderById } from "@/lib/services/order.service";

const STATUS_NOTIFICATION_TYPES: Partial<
  Record<OrderStatus, EmailNotificationType>
> = {
  [OrderStatus.CONFIRMED]: EmailNotificationType.STATUS_CONFIRMED,
  [OrderStatus.PROCESSING]: EmailNotificationType.STATUS_PROCESSING,
  [OrderStatus.SHIPPED]: EmailNotificationType.STATUS_SHIPPED,
  [OrderStatus.DELIVERED]: EmailNotificationType.STATUS_DELIVERED,
  [OrderStatus.CANCELLED]: EmailNotificationType.STATUS_CANCELLED,
};

const STATUS_EMAIL_COPY: Partial<
  Record<OrderStatus, { headline: string; message: string }>
> = {
  [OrderStatus.CONFIRMED]: {
    headline: "Order confirmed",
    message:
      "Your order has been confirmed. We are preparing it for fulfillment.",
  },
  [OrderStatus.PROCESSING]: {
    headline: "Order is being processed",
    message: "We are now processing your order and will ship it soon.",
  },
  [OrderStatus.SHIPPED]: {
    headline: "Order shipped",
    message: "Your order is on its way. You should receive it soon.",
  },
  [OrderStatus.DELIVERED]: {
    headline: "Order delivered",
    message: "Your order has been delivered. We hope you enjoy your purchase.",
  },
  [OrderStatus.CANCELLED]: {
    headline: "Order cancelled",
    message:
      "Your order has been cancelled. If you have questions, please contact us.",
  },
};

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

async function reserveNotification(
  orderId: string,
  type: EmailNotificationType,
): Promise<boolean> {
  try {
    await db.sentEmail.create({
      data: { orderId, type },
    });
    return true;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      emailLogger.info("Skipping duplicate email", { orderId, type });
      return false;
    }
    throw err;
  }
}

async function releaseNotification(
  orderId: string,
  type: EmailNotificationType,
): Promise<void> {
  await db.sentEmail.deleteMany({
    where: { orderId, type },
  });
}

async function sendHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  emailLogger.info("Resend email sent", {
    emailId: response.data?.id,
    to: params.to,
    subject: params.subject,
  });
}

async function sendWithDedup(
  orderId: string,
  type: EmailNotificationType,
  send: () => Promise<void>,
): Promise<void> {
  if (!isEmailConfigured()) {
    emailLogger.warn("Email not configured; skipping send", { orderId, type });
    return;
  }

  const reserved = await reserveNotification(orderId, type);
  if (!reserved) return;

  try {
    await send();
    emailLogger.info("Email sent", { orderId, type });
  } catch (err) {
    await releaseNotification(orderId, type);
    emailLogger.error("Failed to send email", err, { orderId, type });
  }
}

async function loadOrderForEmail(orderId: string) {
  return getAdminOrderById(orderId);
}

/** Customer confirmation + admin alert after successful checkout. */
export async function sendOrderPlacedEmails(orderId: string): Promise<void> {
  const order = await loadOrderForEmail(orderId);
  if (!order) {
    emailLogger.warn("Order not found for placement emails", { orderId });
    return;
  }

  const orderData = buildOrderEmailData(order);
  const adminData = buildAdminOrderEmailData(order);
  const brandOrder = order.orderNumber;

  await sendWithDedup(orderId, EmailNotificationType.ORDER_CONFIRMATION, async () => {
    const html = await render(OrderConfirmationEmail({ order: orderData }));
    await sendHtmlEmail({
      to: orderData.customerEmail,
      subject: `Order confirmation — ${brandOrder}`,
      html,
    });
  });

  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    emailLogger.warn("ADMIN_EMAIL not set; skipping admin notification", {
      orderId,
    });
    return;
  }

  await sendWithDedup(orderId, EmailNotificationType.ADMIN_NEW_ORDER, async () => {
    const html = await render(AdminNewOrderEmail({ order: adminData }));
    await sendHtmlEmail({
      to: adminEmail,
      subject: `New order — ${brandOrder}`,
      html,
    });
  });
}

/** Customer notification when admin updates order status. */
export async function sendOrderStatusEmail(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const notificationType = STATUS_NOTIFICATION_TYPES[status];
  const copy = STATUS_EMAIL_COPY[status];
  if (!notificationType || !copy) return;

  const order = await loadOrderForEmail(orderId);
  if (!order) {
    emailLogger.warn("Order not found for status email", { orderId });
    return;
  }

  const orderData = buildOrderEmailData(order);

  await sendWithDedup(orderId, notificationType, async () => {
    const html = await render(
      OrderStatusEmail({
        order: orderData,
        headline: copy.headline,
        message: copy.message,
      }),
    );
    await sendHtmlEmail({
      to: orderData.customerEmail,
      subject: `${copy.headline} — ${order.orderNumber}`,
      html,
    });
  });
}

/** Fire-and-forget wrapper — never blocks checkout or admin UI. */
export function queueOrderPlacedEmails(orderId: string): void {
  void sendOrderPlacedEmails(orderId).catch((err) => {
    emailLogger.error("Order placed emails failed", err, { orderId });
  });
}

export function queueOrderStatusEmail(
  orderId: string,
  status: OrderStatus,
): void {
  void sendOrderStatusEmail(orderId, status).catch((err) => {
    emailLogger.error("Order status email failed", err, { orderId, status });
  });
}
