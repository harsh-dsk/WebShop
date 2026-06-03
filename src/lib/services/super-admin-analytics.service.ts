import { OrderStatus } from "@prisma/client";

import { db } from "@/lib/db";

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

export async function getSuperAdminAnalytics() {
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
  ]);

  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stock: true,
      lowStockThreshold: true,
      isActive: true,
      variants: { select: { stock: true, isActive: true } },
    },
  });

  const lowStock: Array<{
    id: string;
    name: string;
    slug: string;
    stock: number;
    lowStockThreshold: number;
  }> = [];

  for (const p of products) {
    const variantStock = p.variants
      .filter((v) => v.isActive)
      .reduce((sum, v) => sum + v.stock, 0);
    const effectiveStock =
      p.variants.length > 0 ? variantStock : p.stock;

    if (
      p.isActive &&
      effectiveStock > 0 &&
      effectiveStock <= p.lowStockThreshold
    ) {
      lowStock.push({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: effectiveStock,
        lowStockThreshold: p.lowStockThreshold,
      });
    }
  }

  lowStock.sort((a, b) => a.stock - b.stock);

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
    lowStockProducts: lowStock.slice(0, 15),
    outOfStockCount: products.filter((p) => {
      const variantStock = p.variants
        .filter((v) => v.isActive)
        .reduce((sum, v) => sum + v.stock, 0);
      const effective = p.variants.length > 0 ? variantStock : p.stock;
      return p.isActive && effective === 0;
    }).length,
    generatedAt: now,
  };
}
