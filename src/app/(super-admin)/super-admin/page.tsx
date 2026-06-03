import Link from "next/link";
import { BarChart3, Settings, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getSuperAdminAnalytics } from "@/lib/services/super-admin-analytics.service";
import { getRuntimeSiteConfig } from "@/lib/services/site-settings.service";

export default async function SuperAdminOverviewPage() {
  const [analytics, config] = await Promise.all([
    getSuperAdminAnalytics(),
    getRuntimeSiteConfig(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform overview"
        description={`Manage ${config.brand.name} settings, users, and analytics.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total revenue"
          value={formatPrice(analytics.totalRevenue)}
          href={ROUTES.superAdminAnalytics}
          icon={BarChart3}
        />
        <StatsCard
          label="Total orders"
          value={analytics.totalOrders}
          href={ROUTES.adminOrders}
          icon={BarChart3}
        />
        <StatsCard
          label="Customers"
          value={analytics.totalCustomers}
          href={ROUTES.superAdminUsers}
          icon={Users}
        />
        <StatsCard
          label="Products"
          value={analytics.totalProducts}
          href={ROUTES.adminProducts}
          icon={Settings}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link href={ROUTES.superAdminUsers} className="block text-accent hover:underline">
              User management →
            </Link>
            <Link href={ROUTES.superAdminSettings} className="block text-accent hover:underline">
              Site settings & homepage →
            </Link>
            <Link href={ROUTES.superAdminTheme} className="block text-accent hover:underline">
              Theme colors →
            </Link>
            <Link href={ROUTES.superAdminBranding} className="block text-accent hover:underline">
              Logo & favicon →
            </Link>
            <Link href={ROUTES.superAdminAnalytics} className="block text-accent hover:underline">
              Full analytics →
            </Link>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
              <p className="text-2xl font-bold">{formatPrice(analytics.revenueLast7Days)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
              <p className="text-2xl font-bold">{formatPrice(analytics.revenueLast30Days)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
