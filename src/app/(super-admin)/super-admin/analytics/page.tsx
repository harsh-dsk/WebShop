import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getSuperAdminAnalytics } from "@/lib/services/super-admin-analytics.service";
import { Banknote, Package, Receipt, Users } from "lucide-react";

export default async function SuperAdminAnalyticsPage() {
  const analytics = await getSuperAdminAnalytics();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description={`Updated ${analytics.generatedAt.toLocaleString()}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total revenue" value={formatPrice(analytics.totalRevenue)} icon={Banknote} />
        <StatsCard label="Total orders" value={analytics.totalOrders} icon={Receipt} />
        <StatsCard label="Total customers" value={analytics.totalCustomers} icon={Users} />
        <StatsCard label="Total products" value={analytics.totalProducts} icon={Package} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard
          label="Revenue (7 days)"
          value={formatPrice(analytics.revenueLast7Days)}
          icon={Banknote}
        />
        <StatsCard
          label="Revenue (30 days)"
          value={formatPrice(analytics.revenueLast30Days)}
          icon={Banknote}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top selling products</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topSellingProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {analytics.topSellingProducts.map((p) => (
                  <li key={p.productId} className="flex justify-between py-2">
                    <span>{p.productName}</span>
                    <span className="text-muted-foreground">
                      {p.unitsSold} sold · {formatPrice(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low stock products</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low stock items.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {analytics.lowStockProducts.map((p) => (
                  <li key={p.id} className="flex justify-between py-2">
                    <Link
                      href={`${ROUTES.adminProducts}/${p.id}/edit`}
                      className="hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <span className="text-amber-700">
                      {p.stock} / {p.lowStockThreshold}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Out of stock (active): {analytics.outOfStockCount}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
