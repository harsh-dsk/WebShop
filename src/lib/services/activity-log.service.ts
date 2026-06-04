import type { Prisma, Role } from "@prisma/client";

import {
  ActivityAction,
  type ActivityActionType,
  type ActivityEntityTypeValue,
} from "@/lib/activity-log/actions";
import { getUserDisplayName } from "@/lib/activity-log/user-display";
import { db } from "@/lib/db";

const PAGE_SIZE = 25;

export type LogActivityInput = {
  userId: string;
  userName: string;
  userRole: Role;
  action: ActivityActionType;
  entityType: ActivityEntityTypeValue;
  entityId?: string | null;
  details?: Prisma.InputJsonValue;
};

export type ActivityLogFilters = {
  search?: string;
  action?: ActivityActionType;
  role?: Role;
  entityType?: ActivityEntityTypeValue;
  page?: number;
};

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        userId: input.userId,
        userName: input.userName,
        userRole: input.userRole,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        details: input.details ?? undefined,
      },
    });
  } catch (error) {
    console.error("[activity-log] Failed to write activity:", error);
  }
}

type ActorFields = {
  id: string;
  email: string;
  role: Role;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export async function logActivityForActor(
  actor: ActorFields,
  input: Omit<LogActivityInput, "userId" | "userName" | "userRole">,
): Promise<void> {
  return logActivity({
    userId: actor.id,
    userName: getUserDisplayName(actor),
    userRole: actor.role,
    ...input,
  });
}

export async function queryActivityLogs(filters: ActivityLogFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ActivityLogWhereInput = {};

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.role) {
    where.userRole = filters.role;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { userName: { contains: q, mode: "insensitive" } },
      { action: { contains: q, mode: "insensitive" } },
      { entityType: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.activityLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getActivityLogSummary() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [total, last24h, byRole, recentActions] = await Promise.all([
    db.activityLog.count(),
    db.activityLog.count({ where: { createdAt: { gte: since24h } } }),
    db.activityLog.groupBy({
      by: ["userRole"],
      _count: { _all: true },
      where: { createdAt: { gte: since24h } },
    }),
    db.activityLog.groupBy({
      by: ["action"],
      _count: { _all: true },
      where: { createdAt: { gte: since24h } },
    }),
  ]);

  const roleCounts = Object.fromEntries(
    byRole.map((r) => [r.userRole, r._count._all]),
  ) as Partial<Record<Role, number>>;

  const topActions = recentActions
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 5)
    .map((a) => ({
      action: a.action as ActivityActionType,
      count: a._count._all,
    }));

  return {
    total,
    last24h,
    roleCounts,
    topActions,
  };
}

export { PAGE_SIZE as ACTIVITY_LOG_PAGE_SIZE };
