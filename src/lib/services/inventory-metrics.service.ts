import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type LowStockProductRow = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  lowStockThreshold: number;
};

const EFFECTIVE_STOCK_CTE = Prisma.sql`
  WITH effective AS (
    SELECT
      p.id,
      p.name,
      p.slug,
      p.stock,
      p."lowStockThreshold",
      p."isActive",
      CASE
        WHEN EXISTS (
          SELECT 1 FROM product_variants v
          WHERE v."productId" = p.id AND v."isActive" = true
        ) THEN (
          SELECT COALESCE(SUM(v.stock), 0)
          FROM product_variants v
          WHERE v."productId" = p.id AND v."isActive" = true
        )
        ELSE p.stock
      END::int AS effective_stock
    FROM products p
  )
`;

export async function countLowStockProducts(): Promise<number> {
  const rows = await db.$queryRaw<[{ count: bigint }]>(
    Prisma.sql`
      ${EFFECTIVE_STOCK_CTE}
      SELECT COUNT(*)::bigint AS count
      FROM effective
      WHERE effective_stock > 0
        AND effective_stock <= "lowStockThreshold"
    `,
  );
  return Number(rows[0]?.count ?? 0);
}

export async function countOutOfStockActiveProducts(): Promise<number> {
  const rows = await db.$queryRaw<[{ count: bigint }]>(
    Prisma.sql`
      ${EFFECTIVE_STOCK_CTE}
      SELECT COUNT(*)::bigint AS count
      FROM effective
      WHERE "isActive" = true AND effective_stock = 0
    `,
  );
  return Number(rows[0]?.count ?? 0);
}

export async function sumTotalInventoryUnits(): Promise<number> {
  const rows = await db.$queryRaw<[{ total: bigint | null }]>(
    Prisma.sql`
      ${EFFECTIVE_STOCK_CTE}
      SELECT COALESCE(SUM(effective_stock), 0)::bigint AS total
      FROM effective
    `,
  );
  return Number(rows[0]?.total ?? 0);
}

export async function getLowStockProducts(limit = 15): Promise<LowStockProductRow[]> {
  const rows = await db.$queryRaw<
    Array<{
      id: string;
      name: string;
      slug: string;
      stock: number;
      lowStockThreshold: number;
    }>
  >(
    Prisma.sql`
      ${EFFECTIVE_STOCK_CTE}
      SELECT
        id,
        name,
        slug,
        effective_stock AS stock,
        "lowStockThreshold"
      FROM effective
      WHERE "isActive" = true
        AND effective_stock > 0
        AND effective_stock <= "lowStockThreshold"
      ORDER BY effective_stock ASC
      LIMIT ${limit}
    `,
  );
  return rows;
}
