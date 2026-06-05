import Link from "next/link";
import { ScrollText } from "lucide-react";

import type { ActivityLogRecord } from "@/types/activity-log";
import { EmptyState } from "@/components/ui/empty-state";

import { ActivityActionBadge, ActivityRoleBadge } from "@/components/super-admin/activity-log-badges";
import {
  ACTIVITY_ACTION_LABELS,
  type ActivityActionType,
} from "@/lib/activity-log/actions";
import { ROUTES } from "@/lib/constants/routes";

type ActivityLogTableProps = {
  logs: ActivityLogRecord[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

function buildPageHref(page: number, searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${ROUTES.superAdminActivity}?${qs}` : ROUTES.superAdminActivity;
}

function formatDetails(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const record = details as Record<string, unknown>;
  const parts: string[] = [];
  if (record.orderNumber) parts.push(`Order ${record.orderNumber}`);
  if (record.productName) parts.push(String(record.productName));
  if (record.previousStatus && record.newStatus) {
    parts.push(`${record.previousStatus} → ${record.newStatus}`);
  }
  if (record.previousRole && record.newRole) {
    parts.push(`${record.previousRole} → ${record.newRole}`);
  }
  if (record.section) parts.push(`Section: ${record.section}`);
  if (record.stock !== undefined) parts.push(`Stock: ${record.stock}`);
  if (record.email) parts.push(String(record.email));
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function ActivityLogTable({
  logs,
  page,
  totalPages,
  searchParams,
}: ActivityLogTableProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No activity found"
        description="Try adjusting your search or filter criteria to see audit events."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="data-table-wrap">
        <div className="data-table-scroll">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>When</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actionLabel =
                  ACTIVITY_ACTION_LABELS[log.action as ActivityActionType] ??
                  log.action;
                const detailText = formatDetails(log.details);

                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      <p className="font-medium text-foreground">{log.userName}</p>
                      <p className="text-xs text-muted-foreground">{log.userId}</p>
                    </td>
                    <td>
                      <ActivityRoleBadge role={log.userRole} />
                    </td>
                    <td>
                      <ActivityActionBadge action={log.action as ActivityActionType} />
                      <span className="sr-only">{actionLabel}</span>
                    </td>
                    <td>
                      <p className="text-sm">{log.entityType}</p>
                      {log.entityId && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {log.entityId}
                        </p>
                      )}
                    </td>
                    <td className="max-w-xs text-sm text-muted-foreground">
                      {detailText ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Activity pagination"
        >
          {page > 1 && (
            <Link
              href={buildPageHref(page - 1, searchParams)}
              className="filter-pill"
            >
              Previous
            </Link>
          )}
          <span className="px-3 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageHref(page + 1, searchParams)}
              className="filter-pill"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
