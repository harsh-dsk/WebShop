import { db } from "@/lib/db";
import {
  countLowStockProducts,
  countOutOfStockActiveProducts,
  sumTotalInventoryUnits,
} from "@/lib/services/inventory-metrics.service";

export async function getAdminDashboardStats() {
  const [
    productCount,
    activeProductCount,
    categoryCount,
    activeCategoryCount,
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    lowStockCount,
    outOfStock,
    totalUnits,
    recentProducts,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.category.count(),
    db.category.count({ where: { isActive: true } }),
    db.order.count(),
    db.order.aggregate({
      where: {
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      _sum: { total: true },
    }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    countLowStockProducts(),
    countOutOfStockActiveProducts(),
    sumTotalInventoryUnits(),
    db.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        stock: true,
        createdAt: true,
        category: { select: { name: true } },
        _count: { select: { variants: true } },
      },
    }),
  ]);

  return {
    productCount,
    activeProductCount,
    categoryCount,
    activeCategoryCount,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    pendingOrders,
    deliveredOrders,
    lowStockCount,
    outOfStock,
    totalUnits,
    recentProducts,
  };
}

export async function getInventoryRows() {
  return db.product.findMany({
    orderBy: { name: "asc" },
    include: {
      category: { select: { name: true } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });
}
