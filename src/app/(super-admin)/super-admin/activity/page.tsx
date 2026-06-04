import { Role } from "@prisma/client";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ActivityLogFilters } from "@/components/super-admin/activity-log-filters";
import { ActivityLogTable } from "@/components/super-admin/activity-log-table";
import { ActivityRecentCards } from "@/components/super-admin/activity-recent-cards";
import {
  ActivityAction,
  ActivityEntityType,
  type ActivityActionType,
  type ActivityEntityTypeValue,
} from "@/lib/activity-log/actions";
import {
  getActivityLogSummary,
  queryActivityLogs,
} from "@/lib/services/activity-log.service";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    action?: string;
    role?: string;
    entityType?: string;
    page?: string;
  }>;
};

function parseAction(value?: string): ActivityActionType | undefined {
  if (!value) return undefined;
  return Object.values(ActivityAction).includes(value as ActivityActionType)
    ? (value as ActivityActionType)
    : undefined;
}

function parseEntityType(value?: string): ActivityEntityTypeValue | undefined {
  if (!value) return undefined;
  const allowed = Object.values(ActivityEntityType);
  return allowed.includes(value as ActivityEntityTypeValue)
    ? (value as ActivityEntityTypeValue)
    : undefined;
}

export default async function SuperAdminActivityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const role =
    params.role && Object.values(Role).includes(params.role as Role)
      ? (params.role as Role)
      : undefined;

  const filterParams = {
    q: params.q,
    action: params.action,
    role: params.role,
    entityType: params.entityType,
  };

  const [summary, result] = await Promise.all([
    getActivityLogSummary(),
    queryActivityLogs({
      search: params.q,
      action: parseAction(params.action),
      role,
      entityType: parseEntityType(params.entityType),
      page,
    }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Activity log"
        description="Audit trail of customer, admin, and super admin actions across the platform."
      />

      <ActivityRecentCards summary={summary} />

      <Suspense fallback={<div className="skeleton h-24 w-full" />}>
        <ActivityLogFilters />
      </Suspense>

      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {result.items.length} of {result.total} events (newest first)
        </p>
        <ActivityLogTable
          logs={result.items}
          page={result.page}
          totalPages={result.totalPages}
          searchParams={filterParams}
        />
      </div>
    </div>
  );
}
