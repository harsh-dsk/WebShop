import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";

import { siteConfig } from "@/config/site";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";

export { getEffectiveStock, getPrimaryImage, parseProductImages } from "@/lib/catalog.utils";

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export type CatalogQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  categorySlug?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  includeInactive?: boolean;
};

function buildOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "name":
      return { name: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function queryProducts(params: CatalogQuery = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? siteConfig.catalog.productsPerPage;
  const sort = params.sort ?? siteConfig.catalog.defaultSort;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProductWhereInput = {};

  if (!params.includeInactive) {
    where.isActive = true;
  }

  if (params.featuredOnly) {
    where.isFeatured = true;
  }

  if (params.categorySlug) {
    where.category = { slug: params.categorySlug, isActive: true };
  }

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) {
      where.price.gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      where.price.lte = params.maxPrice;
    }
  }

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { select: { stock: true, isActive: true } },
      },
      orderBy: buildOrderBy(sort),
      skip,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

const productBySlugInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      attributeSchema: true,
      imageUrl: true,
      description: true,
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

async function fetchProductBySlug(slug: string, includeInactive: boolean) {
  return db.product.findFirst({
    where: {
      slug,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: productBySlugInclude,
  });
}

function getCachedActiveProductBySlug(slug: string) {
  return unstable_cache(
    () => fetchProductBySlug(slug, false),
    ["product-by-slug", slug],
    {
      tags: [CACHE_TAGS.catalog, `product:${slug}`],
      revalidate: 120,
    },
  )();
}

export const getProductBySlug = reactCache(
  async (slug: string, includeInactive = false) => {
    if (includeInactive) {
      return fetchProductBySlug(slug, true);
    }
    return getCachedActiveProductBySlug(slug);
  },
);

export async function getRelatedProducts(params: {
  productId: string;
  categoryId: string;
  limit?: number;
}) {
  const limit = params.limit ?? 8;
  return db.product.findMany({
    where: {
      isActive: true,
      categoryId: params.categoryId,
      NOT: { id: params.productId },
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true } },
      variants: { select: { stock: true, isActive: true } },
    },
  });
}

export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const products = await db.product.findMany({
    where: { isActive: true, slug: { in: slugs } },
    include: {
      category: { select: { name: true } },
      variants: { select: { stock: true, isActive: true } },
    },
  });
  const map = new Map(products.map((p) => [p.slug, p]));
  return slugs
    .map((s) => map.get(s))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
}

const fetchActiveCategories = unstable_cache(
  async () =>
    db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
  ["active-categories"],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: 300,
  },
);

export const getActiveCategories = reactCache(fetchActiveCategories);

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug, isActive: true },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}

const fetchBestSellingProducts = async (pageSize: number) => {
  const grouped = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: pageSize,
  });

  if (grouped.length === 0) {
    return queryProducts({ pageSize, sort: "newest" });
  }

  const productIds = grouped.map((g) => g.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: { select: { stock: true, isActive: true } },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const items = productIds
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return { items, total: items.length, page: 1, pageSize, totalPages: 1 };
};

const getCachedBestSellers = unstable_cache(
  async (pageSize: number) => fetchBestSellingProducts(pageSize),
  ["best-selling-products"],
  {
    tags: [CACHE_TAGS.analytics, CACHE_TAGS.catalog],
    revalidate: 120,
  },
);

export async function getBestSellingProducts(pageSize = 8) {
  return getCachedBestSellers(pageSize);
}
