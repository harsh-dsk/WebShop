import { auth, currentUser } from "@clerk/nextjs/server";
import { Role, type User } from "@prisma/client";
import { redirect } from "next/navigation";

import { syncClerkPublicMetadata, upsertUserFromClerk } from "@/lib/clerk-sync";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants/routes";

export function isStoreStaff(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function isSuperAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN;
}

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  return upsertUserFromClerk(clerkUser);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.signIn);
  }
  return user;
}

/** Store owner or platform developer — catalog & inventory admin */
export async function requireStoreStaff(): Promise<User> {
  const user = await requireUser();
  if (!isStoreStaff(user.role)) {
    redirect(ROUTES.home);
  }

  await syncClerkPublicMetadata(user.clerkId, {
    role: user.role,
    dbUserId: user.id,
  });

  return user;
}

/** Platform developer only — branding & global settings */
export async function requireSuperAdmin(): Promise<User> {
  const user = await requireUser();
  if (!isSuperAdmin(user.role)) {
    redirect(ROUTES.home);
  }

  await syncClerkPublicMetadata(user.clerkId, {
    role: user.role,
    dbUserId: user.id,
  });

  return user;
}

/** @deprecated Use requireStoreStaff */
export async function requireAdmin(): Promise<User> {
  return requireStoreStaff();
}

export async function getSessionSummary() {
  const { userId, sessionId } = await auth();
  const user = userId ? await getCurrentUser() : null;

  return {
    isSignedIn: Boolean(userId),
    sessionId,
    clerkUserId: userId,
    user,
    role: user?.role ?? null,
    isStoreStaff: user ? isStoreStaff(user.role) : false,
    isSuperAdmin: user ? isSuperAdmin(user.role) : false,
  };
}
