import { auth, currentUser } from "@clerk/nextjs/server";
import { Role, type User } from "@prisma/client";
import { redirect } from "next/navigation";

import { syncClerkPublicMetadata, upsertUserFromClerk } from "@/lib/clerk-sync";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants/routes";

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Returns the database user for the current Clerk session.
 * Creates/syncs the user on first access if the webhook has not run yet.
 */
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

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) {
    redirect(ROUTES.home);
  }

  await syncClerkPublicMetadata(user.clerkId, {
    role: user.role,
    dbUserId: user.id,
  });

  return user;
}

export function isAdmin(user: User): boolean {
  return user.role === Role.ADMIN;
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
    isAdmin: user?.role === Role.ADMIN,
  };
}
