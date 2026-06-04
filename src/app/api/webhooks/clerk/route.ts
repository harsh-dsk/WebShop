import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import {
  ActivityAction,
  ActivityEntityType,
} from "@/lib/activity-log/actions";
import {
  deleteUserByClerkId,
  upsertUserFromClerkData,
  type ClerkUserData,
} from "@/lib/clerk-sync";
import { db } from "@/lib/db";
import { logActivityForActor } from "@/lib/services/activity-log.service";

type ClerkWebhookUser = {
  id: string;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
};

function webhookUserToData(data: ClerkWebhookUser): ClerkUserData {
  const email =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      ?.email_address ?? data.email_addresses[0]?.email_address ?? "";

  return {
    id: data.id,
    email,
    firstName: data.first_name,
    lastName: data.last_name,
    imageUrl: data.image_url,
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: WebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const data = event.data as unknown as ClerkWebhookUser;
        const clerkData = webhookUserToData(data);
        const existing =
          event.type === "user.created"
            ? await db.user.findUnique({ where: { clerkId: clerkData.id } })
            : null;
        const user = await upsertUserFromClerkData(clerkData);

        if (event.type === "user.created" && !existing) {
          await logActivityForActor(user, {
            action: ActivityAction.USER_REGISTERED,
            entityType: ActivityEntityType.USER,
            entityId: user.id,
            details: { email: user.email },
          });
        }
        break;
      }
      case "user.deleted": {
        const clerkId = event.data.id as string;
        if (clerkId) {
          await deleteUserByClerkId(clerkId);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
