"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/orders";
import {
  ActivityAction,
  ActivityEntityType,
} from "@/lib/activity-log/actions";
import {
  isRoleDemotion,
  isRolePromotion,
} from "@/lib/activity-log/user-display";
import { requireSuperAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { logActivityForActor } from "@/lib/services/activity-log.service";
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
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!target) return { error: "User not found" };

    await updateUserRole(userId, newRole, actor.id);

    const promoted = isRolePromotion(target.role, newRole);
    const demoted = isRoleDemotion(target.role, newRole);

    if (promoted || demoted) {
      await logActivityForActor(actor, {
        action: promoted ? ActivityAction.USER_PROMOTED : ActivityAction.USER_DEMOTED,
        entityType: ActivityEntityType.USER,
        entityId: userId,
        details: {
          email: target.email,
          previousRole: target.role,
          newRole,
        },
      });
    }

    revalidatePath(ROUTES.superAdminUsers);
    revalidatePath(`${ROUTES.superAdminUsers}/${userId}`);
    revalidatePath(ROUTES.superAdminActivity);
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
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!target) return { error: "User not found" };

    await setUserBlocked(userId, isBlocked, actor.id);

    await logActivityForActor(actor, {
      action: isBlocked ? ActivityAction.USER_BLOCKED : ActivityAction.USER_UNBLOCKED,
      entityType: ActivityEntityType.USER,
      entityId: userId,
      details: { email: target.email },
    });

    revalidatePath(ROUTES.superAdminUsers);
    revalidatePath(`${ROUTES.superAdminUsers}/${userId}`);
    revalidatePath(ROUTES.superAdminActivity);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not update user",
    };
  }
}
