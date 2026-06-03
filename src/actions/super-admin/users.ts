"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/orders";
import { requireSuperAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import {
  setUserBlocked,
  updateUserRole,
} from "@/lib/services/user-management.service";

export async function promoteUserRole(
  userId: string,
  newRole: Role,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();

  try {
    await updateUserRole(userId, newRole, actor.id);
    revalidatePath(ROUTES.superAdminUsers);
    revalidatePath(`${ROUTES.superAdminUsers}/${userId}`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not update role",
    };
  }
}

export async function toggleUserBlocked(
  userId: string,
  isBlocked: boolean,
): Promise<ActionState> {
  const actor = await requireSuperAdmin();

  try {
    await setUserBlocked(userId, isBlocked, actor.id);
    revalidatePath(ROUTES.superAdminUsers);
    revalidatePath(`${ROUTES.superAdminUsers}/${userId}`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not update user",
    };
  }
}
