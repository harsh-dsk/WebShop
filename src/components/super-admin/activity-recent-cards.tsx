import { Activity, Clock, Shield, Users } from "lucide-react";

import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityActionBadge } from "@/components/super-admin/activity-log-badges";
import {
  ACTIVITY_ACTION_LABELS,
  type ActivityActionType,
} from "@/lib/activity-log/actions";
// ActivityActionType used in map callback annotation
import type { getActivityLogSummary } from "@/lib/services/activity-log.service";

type ActivityRecentCardsProps = {
  summary: Awaited<ReturnType<typeof getActivityLogSummary>>;
};

export function ActivityRecentCards({ summary }: ActivityRecentCardsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total events"
          value={summary.total}
          icon={Activity}
        />
        <StatsCard
          label="Last 24 hours"
          value={summary.last24h}
          icon={Clock}
        />
        <StatsCard
          label="Admin actions (24h)"
          value={(summary.roleCounts.ADMIN ?? 0) + (summary.roleCounts.SUPER_ADMIN ?? 0)}
          icon={Shield}
        />
        <StatsCard
          label="Customer actions (24h)"
          value={summary.roleCounts.CUSTOMER ?? 0}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top actions (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.topActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {summary.topActions.map((item: { action: ActivityActionType; count: number }) => (
                <li
                  key={item.action}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <ActivityActionBadge action={item.action} />
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {item.count}
                    <span className="ml-1 font-normal text-muted-foreground">
                      {item.count === 1 ? "event" : "events"}
                    </span>
                  </span>
                  <span className="sr-only">
                    {ACTIVITY_ACTION_LABELS[item.action as ActivityActionType]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
