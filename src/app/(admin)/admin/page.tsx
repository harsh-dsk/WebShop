import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  FolderTree,
  Package,
  PackageX,
  Receipt,
  Warehouse,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/routes";
import { getAdminDashboardStats } from "@/lib/services/admin.service";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description={`Manage catalog and inventory for ${siteConfig.brand.name}. Branding is configured in site config by your developer.`}
        actions={
          <Link href={`${ROUTES.adminProducts}/new`}>
            <Button>Add product</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total orders"
          value={stats.totalOrders}
          href={ROUTES.adminOrders}
          linkLabel="View orders"
          icon={Receipt}
        />
        <StatsCard
          label="Total revenue"
          value={Intl.NumberFormat(siteConfig.currency.locale, {
            style: "currency",
            currency: siteConfig.currency.code,
            maximumFractionDigits: 2,
          }).format(stats.totalRevenue)}
          href={ROUTES.adminOrders}
          icon={Banknote}
        />
        <StatsCard
          label="Pending orders"
          value={stats.pendingOrders}
          href={ROUTES.adminOrders}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          label="Delivered orders"
          value={stats.deliveredOrders}
          href={ROUTES.adminOrders}
          icon={Receipt}
        />
        <StatsCard
          label="Total products"
          value={stats.productCount}
          href={ROUTES.adminProducts}
          linkLabel="Manage products"
          icon={Package}
        />
        <StatsCard
          label="Active products"
          value={stats.activeProductCount}
          href={ROUTES.adminProducts}
          icon={Package}
        />
        <StatsCard
          label="Categories"
          value={stats.categoryCount}
          href={ROUTES.adminCategories}
          linkLabel="Manage categories"
          icon={FolderTree}
        />
        <StatsCard
          label="Units in stock"
          value={stats.totalUnits}
          href={ROUTES.adminInventory}
          linkLabel="Inventory"
          icon={Warehouse}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          label="Low stock"
          value={stats.lowStockCount}
          href={ROUTES.adminInventory}
          linkLabel="Review inventory"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          label="Out of stock"
          value={stats.outOfStock}
          href={ROUTES.adminInventory}
          icon={PackageX}
          variant="danger"
        />
        <StatsCard
          label="Active categories"
          value={stats.activeCategoryCount}
          href={ROUTES.adminCategories}
          icon={FolderTree}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recently added</CardTitle>
          <Link href={ROUTES.adminProducts}>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products yet. Create your first product to get started.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`${ROUTES.adminProducts}/${p.id}/edit`}
                      className="font-medium hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.category.name}
                      {p._count.variants > 0 &&
                        ` · ${p._count.variants} variant(s)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.isActive ? "default" : "muted"}>
                      {p.isActive ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Stock: {p.stock}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
