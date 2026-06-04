import type { Role } from "@prisma/client";

type UserNameFields = {
  email: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export function getUserDisplayName(user: UserNameFields): string {
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return user.fullName?.trim() || fromParts || user.email;
}

const ROLE_RANK: Record<Role, number> = {
  CUSTOMER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

export function isRolePromotion(previousRole: Role, newRole: Role): boolean {
  return ROLE_RANK[newRole] > ROLE_RANK[previousRole];
}

export function isRoleDemotion(previousRole: Role, newRole: Role): boolean {
  return ROLE_RANK[newRole] < ROLE_RANK[previousRole];
}
