import { db } from "@/lib/db";

export async function getAdminDashboardStats() {
  const [
    productCount,
    activeProductCount,
    categoryCount,
    activeCategoryCount,
    products,
    recentProducts,
    outOfStock,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.category.count(),
    db.category.count({ where: { isActive: true } }),
    db.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
        isActive: true,
        variants: { select: { stock: true, isActive: true } },
      },
    }),
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
    db.product.count({ where: { stock: 0, isActive: true } }),
  ]);

  let lowStockCount = 0;
  let totalUnits = 0;

  for (const p of products) {
    const variantStock = p.variants
      .filter((v) => v.isActive)
      .reduce((sum, v) => sum + v.stock, 0);
    const effectiveStock =
      p.variants.length > 0 ? variantStock : p.stock;
    totalUnits += effectiveStock;

    if (
      effectiveStock > 0 &&
      effectiveStock <= p.lowStockThreshold
    ) {
      lowStockCount += 1;
    }
  }

  return {
    productCount,
    activeProductCount,
    categoryCount,
    activeCategoryCount,
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
