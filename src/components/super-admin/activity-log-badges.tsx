import type { Role } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_ACTION_LABELS,
  ActivityAction,
  type ActivityActionType,
} from "@/lib/activity-log/actions";
import { cn } from "@/lib/utils";

const ACTION_VARIANTS: Partial<
  Record<ActivityActionType, "default" | "accent" | "warning" | "danger" | "success" | "muted">
> = {
  [ActivityAction.USER_REGISTERED]: "success",
  [ActivityAction.ORDER_PLACED]: "accent",
  [ActivityAction.PRODUCT_CREATED]: "success",
  [ActivityAction.PRODUCT_UPDATED]: "default",
  [ActivityAction.PRODUCT_DELETED]: "danger",
  [ActivityAction.INVENTORY_UPDATED]: "warning",
  [ActivityAction.ORDER_STATUS_CHANGED]: "default",
  [ActivityAction.ORDER_CANCELLED]: "danger",
  [ActivityAction.USER_PROMOTED]: "success",
  [ActivityAction.USER_DEMOTED]: "warning",
  [ActivityAction.USER_BLOCKED]: "danger",
  [ActivityAction.USER_UNBLOCKED]: "success",
  [ActivityAction.THEME_UPDATED]: "accent",
  [ActivityAction.BRANDING_UPDATED]: "accent",
  [ActivityAction.SETTINGS_UPDATED]: "default",
};

export function ActivityActionBadge({ action }: { action: ActivityActionType }) {
  const label = ACTIVITY_ACTION_LABELS[action] ?? action;
  const variant = ACTION_VARIANTS[action] ?? "muted";

  return <Badge variant={variant}>{label}</Badge>;
}

export function ActivityRoleBadge({ role }: { role: Role }) {
  return (
    <Badge
      variant={role === "SUPER_ADMIN" ? "accent" : role === "ADMIN" ? "default" : "muted"}
      className={cn(role === "SUPER_ADMIN" && "font-medium")}
    >
      {role.replace("_", " ")}
    </Badge>
  );
}
