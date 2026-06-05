import { OrderStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import {
  countOutOfStockActiveProducts,
  getLowStockProducts,
} from "@/lib/services/inventory-metrics.service";

const REVENUE_STATUSES = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
] as const;

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function revenueSince(since: Date): Promise<number> {
  const result = await db.order.aggregate({
    where: {
      status: { in: [...REVENUE_STATUSES] },
      createdAt: { gte: since },
    },
    _sum: { total: true },
  });
  return Number(result._sum.total ?? 0);
}

async function fetchSuperAdminAnalytics() {
  const now = new Date();
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    totalRevenueAgg,
    totalOrders,
    totalCustomers,
    totalProducts,
    revenue7,
    revenue30,
    topSelling,
    lowStockProducts,
    outOfStockCount,
  ] = await Promise.all([
    db.order.aggregate({
      where: { status: { in: [...REVENUE_STATUSES] } },
      _sum: { total: true },
    }),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count(),
    revenueSince(since7),
    revenueSince(since30),
    db.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    getLowStockProducts(15),
    countOutOfStockActiveProducts(),
  ]);

  return {
    totalRevenue: Number(totalRevenueAgg._sum.total ?? 0),
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueLast7Days: revenue7,
    revenueLast30Days: revenue30,
    topSellingProducts: topSelling.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      unitsSold: row._sum.quantity ?? 0,
      revenue: Number(row._sum.lineTotal ?? 0),
    })),
    lowStockProducts,
    outOfStockCount,
    generatedAt: now,
  };
}

export const getSuperAdminAnalytics = unstable_cache(
  fetchSuperAdminAnalytics,
  ["super-admin-analytics"],
  {
    tags: [CACHE_TAGS.analytics],
    revalidate: 60,
  },
);
