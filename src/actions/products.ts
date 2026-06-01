"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStoreStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants/routes";
import { uniqueSlug } from "@/lib/slug";
import {
  productSchema,
  validateMetadataAgainstSchema,
} from "@/lib/validations/product";
import type { AttributeField, ProductImage } from "@/types/catalog";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function parseImages(raw: unknown): ProductImage[] {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as ProductImage[];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw as ProductImage[];
  return [];
}

function parseMetadataFromFormData(formData: FormData): Record<string, unknown> {
  const raw = formData.get("metadata");
  if (typeof raw === "string" && raw.trim()) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* fall through */
    }
  }

  const metadata: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("metadata.")) {
      metadata[key.slice("metadata.".length)] = value;
    }
  }
  return metadata;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStoreStaff();

  const category = await db.category.findUnique({
    where: { id: String(formData.get("categoryId")) },
  });
  if (!category) return { error: "Category not found" };

  const rawMetadata = parseMetadataFromFormData(formData);
  let metadata: Record<string, string | number | boolean> = {};

  try {
    metadata = validateMetadataAgainstSchema(
      rawMetadata,
      category.attributeSchema as AttributeField[],
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid metadata" };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || null,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    sku: formData.get("sku") || null,
    stock: formData.get("stock"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
    images: parseImages(formData.get("images")),
    metadata,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug =
    data.slug ||
    (await uniqueSlug(data.name, async (s) => {
      const found = await db.product.findUnique({ where: { slug: s } });
      return Boolean(found);
    }));

  await db.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      sku: data.sku || null,
      stock: data.stock,
      lowStockThreshold: data.lowStockThreshold,
      categoryId: data.categoryId,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      images: data.images,
      metadata: data.metadata,
    },
  });

  revalidatePath(ROUTES.products);
  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.adminInventory);
  redirect(ROUTES.adminProducts);
}

export async function updateProduct(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStoreStaff();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { error: "Product not found" };

  const category = await db.category.findUnique({
    where: { id: String(formData.get("categoryId")) },
  });
  if (!category) return { error: "Category not found" };

  const rawMetadata = parseMetadataFromFormData(formData);
  let metadata: Record<string, string | number | boolean> = {};

  try {
    metadata = validateMetadataAgainstSchema(
      rawMetadata,
      category.attributeSchema as AttributeField[],
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid metadata" };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || null,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    sku: formData.get("sku") || null,
    stock: formData.get("stock"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
    images: parseImages(formData.get("images")),
    metadata,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug = data.slug ?? existing.slug;

  const conflict = await db.product.findFirst({
    where: { slug, NOT: { id } },
  });
  if (conflict) return { error: "Slug already in use" };

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      sku: data.sku || null,
      stock: data.stock,
      lowStockThreshold: data.lowStockThreshold,
      categoryId: data.categoryId,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      images: data.images,
      metadata: data.metadata,
    },
  });

  revalidatePath(ROUTES.products);
  revalidatePath(`${ROUTES.products}/${slug}`);
  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.adminInventory);
  redirect(ROUTES.adminProducts);
}

export async function deleteProduct(id: string): Promise<ActionState> {
  await requireStoreStaff();

  await db.product.delete({ where: { id } });

  revalidatePath(ROUTES.products);
  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.adminInventory);
  return { success: true };
}

export async function updateProductStock(
  id: string,
  stock: number,
): Promise<ActionState> {
  await requireStoreStaff();

  if (stock < 0) return { error: "Stock cannot be negative" };

  await db.product.update({
    where: { id },
    data: { stock },
  });

  revalidatePath(ROUTES.adminInventory);
  revalidatePath(ROUTES.products);
  return { success: true };
}
