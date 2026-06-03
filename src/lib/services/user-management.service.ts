import { Role, type Prisma, type User } from "@prisma/client";

import { syncClerkPublicMetadata } from "@/lib/clerk-sync";
import { db } from "@/lib/db";

export type UserListFilters = {
  search?: string;
  role?: Role;
  blocked?: boolean;
};

export async function listUsers(filters: UserListFilters = {}) {
  const where: Prisma.UserWhereInput = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.blocked !== undefined) {
    where.isBlocked = filters.blocked;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
    ];
  }

  return db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      fullName: true,
      phone: true,
      role: true,
      isBlocked: true,
      imageUrl: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
}

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      _count: { select: { orders: true } },
    },
  });
}

const ROLE_TRANSITIONS: Record<Role, Role[]> = {
  [Role.CUSTOMER]: [Role.ADMIN],
  [Role.ADMIN]: [Role.CUSTOMER, Role.SUPER_ADMIN],
  [Role.SUPER_ADMIN]: [Role.ADMIN],
};

export function getAllowedRoleTargets(currentRole: Role): Role[] {
  return ROLE_TRANSITIONS[currentRole] ?? [];
}

export async function updateUserRole(
  userId: string,
  newRole: Role,
  actorId: string,
): Promise<User> {
  if (userId === actorId) {
    throw new Error("You cannot change your own role");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const allowed = getAllowedRoleTargets(user.role);
  if (!allowed.includes(newRole)) {
    throw new Error(`Cannot change role from ${user.role} to ${newRole}`);
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  await syncClerkPublicMetadata(updated.clerkId, {
    role: updated.role,
    dbUserId: updated.id,
    isBlocked: updated.isBlocked,
  });

  return updated;
}

export async function setUserBlocked(
  userId: string,
  isBlocked: boolean,
  actorId: string,
): Promise<User> {
  if (userId === actorId) {
    throw new Error("You cannot block your own account");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const updated = await db.user.update({
    where: { id: userId },
    data: { isBlocked },
  });

  await syncClerkPublicMetadata(updated.clerkId, {
    role: updated.role,
    dbUserId: updated.id,
    isBlocked: updated.isBlocked,
  });

  return updated;
}
