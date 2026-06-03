/**
 * Verifies all email notification triggers against a real order in the database.
 *
 * Usage:
 *   npx tsx scripts/test-emails.ts <orderId>
 *   npx tsx scripts/test-emails.ts <orderId> --dry-run
 *
 * Requires RESEND_API_KEY and ADMIN_EMAIL in .env.local (loaded via dotenv if present).
 * With --dry-run, renders templates and logs recipients without calling Resend.
 */

import { OrderStatus } from "@prisma/client";
import { render } from "@react-email/render";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { AdminNewOrderEmail } from "../src/emails/admin-new-order";
import { OrderConfirmationEmail } from "../src/emails/order-confirmation";
import { OrderStatusEmail } from "../src/emails/order-status";
import {
  getAdminEmail,
  getResendApiKey,
  isEmailConfigured,
} from "../src/lib/email/config";
import {
  buildAdminOrderEmailData,
  buildOrderEmailData,
} from "../src/lib/email/order-email-data";
import { db } from "../src/lib/db";
import {
  sendOrderPlacedEmails,
  sendOrderStatusEmail,
} from "../src/lib/services/email.service";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const orderId = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!orderId) {
  console.error("Usage: npx tsx scripts/test-emails.ts <orderId> [--dry-run]");
  process.exit(1);
}

loadEnvFile();

async function dryRunTemplates() {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: {
        select: { email: true, firstName: true, lastName: true, phone: true },
      },
    },
  });

  if (!order) {
    console.error(`Order not found: ${orderId}`);
    process.exit(1);
  }

  const orderData = buildOrderEmailData(order);
  const adminData = buildAdminOrderEmailData(order);

  const templates = [
    {
      name: "ORDER_CONFIRMATION",
      to: orderData.customerEmail,
      html: await render(OrderConfirmationEmail({ order: orderData })),
    },
    {
      name: "ADMIN_NEW_ORDER",
      to: getAdminEmail() ?? "(ADMIN_EMAIL not set)",
      html: await render(AdminNewOrderEmail({ order: adminData })),
    },
    ...(
      [
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ] as const
    ).map((status) => ({
      name: `STATUS_${status}`,
      to: orderData.customerEmail,
      html: "",
      status,
    })),
  ];

  for (const t of templates) {
    if ("status" in t && t.status) {
      const copy: Record<
        string,
        { headline: string; message: string }
      > = {
        CONFIRMED: {
          headline: "Order confirmed",
          message: "Your order has been confirmed.",
        },
        PROCESSING: {
          headline: "Order is being processed",
          message: "We are processing your order.",
        },
        SHIPPED: {
          headline: "Order shipped",
          message: "Your order is on its way.",
        },
        DELIVERED: {
          headline: "Order delivered",
          message: "Your order has been delivered.",
        },
        CANCELLED: {
          headline: "Order cancelled",
          message: "Your order has been cancelled.",
        },
      };
      const c = copy[t.status];
      t.html = await render(
        OrderStatusEmail({
          order: orderData,
          headline: c.headline,
          message: c.message,
        }),
      );
    }
    console.log(`\n--- ${t.name} → ${t.to} (${t.html.length} bytes HTML) ---`);
  }

  console.log("\nDry run complete. No emails sent, no SentEmail records created.");
}

async function liveRun() {
  if (!isEmailConfigured()) {
    console.error("Set RESEND_API_KEY in .env.local before live testing.");
    process.exit(1);
  }
  if (!getAdminEmail()) {
    console.warn("ADMIN_EMAIL is not set; admin notification will be skipped.");
  }

  console.log("Sending order placed emails (confirmation + admin)...");
  await sendOrderPlacedEmails(orderId);

  for (const status of [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ]) {
    console.log(`Sending status email: ${status}`);
    await sendOrderStatusEmail(orderId, status);
  }

  const sent = await db.sentEmail.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });
  console.log("\nSentEmail records:", sent.map((s) => s.type).join(", "));

  console.log(
    "\nRe-run without clearing sent_emails to verify deduplication (should skip duplicates).",
  );
}

async function main() {
  console.log(`Order ID: ${orderId}`);
  console.log(`Mode: ${dryRun ? "dry-run" : "live"}`);
  console.log(`Resend configured: ${Boolean(getResendApiKey())}`);

  if (dryRun) {
    await dryRunTemplates();
  } else {
    await liveRun();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
