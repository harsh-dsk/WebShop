import type { Prisma } from "@prisma/client";

import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";
import type { ProductImage } from "@/types/catalog";

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
      include: { category: { select: { id: true, name: true, slug: true } } },
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

export async function getProductBySlug(slug: string, includeInactive = false) {
  return db.product.findFirst({
    where: {
      slug,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          attributeSchema: true,
        },
      },
    },
  });
}

export async function getActiveCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug, isActive: true },
  });
}

export function getPrimaryImage(images: unknown): ProductImage | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0] as ProductImage;
  if (typeof first?.url === "string") return first;
  return null;
}

export function parseProductImages(images: unknown): ProductImage[] {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img): img is ProductImage =>
      typeof img === "object" &&
      img !== null &&
      "url" in img &&
      typeof (img as ProductImage).url === "string",
  );
}
