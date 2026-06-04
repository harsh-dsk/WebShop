import type { Role } from "@prisma/client";

import type { ActivityActionType, ActivityEntityTypeValue } from "@/lib/activity-log/actions";

export type ActivityLogRecord = {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entityType: string;
  entityId: string | null;
  details: unknown;
  createdAt: Date;
};

export type ActivityLogListItem = ActivityLogRecord & {
  action: ActivityActionType;
  entityType: ActivityEntityTypeValue;
};
