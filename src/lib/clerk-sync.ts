import { clerkClient } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { Role, type User } from "@prisma/client";

import { db } from "@/lib/db";
import type { UserPublicMetadata } from "@/types/auth";

export type ClerkUserData = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

function parseEmailList(envKey: string): string[] {
  return (process.env[envKey] ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRoleForEmail(email: string): Role {
  const normalized = email.trim().toLowerCase();

  if (parseEmailList("SUPER_ADMIN_EMAILS").includes(normalized)) {
    return Role.SUPER_ADMIN;
  }

  if (parseEmailList("ADMIN_EMAILS").includes(normalized)) {
    return Role.ADMIN;
  }

  return Role.CUSTOMER;
}

export function clerkUserToData(clerkUser: ClerkUser): ClerkUserData {
  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  return {
    id: clerkUser.id,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  };
}

export async function syncClerkPublicMetadata(
  clerkId: string,
  metadata: UserPublicMetadata,
): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: metadata,
  });
}

export async function upsertUserFromClerkData(
  data: ClerkUserData,
): Promise<User> {
  if (!data.email) {
    throw new Error("Clerk user has no email address");
  }

  const existing = await db.user.findUnique({
    where: { clerkId: data.id },
  });

  const role = existing?.role ?? resolveRoleForEmail(data.email);

  const user = await db.user.upsert({
    where: { clerkId: data.id },
    create: {
      clerkId: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
      role,
    },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
    },
  });

  await syncClerkPublicMetadata(data.id, {
    role: user.role,
    dbUserId: user.id,
  });

  return user;
}

export async function upsertUserFromClerk(clerkUser: ClerkUser): Promise<User> {
  return upsertUserFromClerkData(clerkUserToData(clerkUser));
}

export async function deleteUserByClerkId(clerkId: string): Promise<void> {
  await db.user.deleteMany({ where: { clerkId } });
}
