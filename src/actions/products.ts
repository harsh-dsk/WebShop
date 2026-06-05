"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  ActivityAction,
  ActivityEntityType,
} from "@/lib/activity-log/actions";
import {
  revalidateAnalyticsCache,
  revalidateCatalogCache,
} from "@/lib/revalidate-cache";
import { requireStoreStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants/routes";
import { logActivityForActor } from "@/lib/services/activity-log.service";
import { uniqueSlug } from "@/lib/slug";
import {
  parseTagsInput,
  parseVariantsJson,
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
  const metadata: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("metadata.")) {
      metadata[key.slice("metadata.".length)] = value;
    }
  }
  return metadata;
}

function parseProductFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,

    shortDescription: formData.get("shortDescription") || null,
    description: formData.get("description") || null,
    descriptionHtml: formData.get("descriptionHtml") || null,

    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,

    sku: formData.get("sku") || null,

    stock: formData.get("stock") ?? "0",

    lowStockThreshold:
      formData.get("lowStockThreshold") ?? "0",

    categoryId: formData.get("categoryId"),

    isActive:
      formData.get("isActive") === "on" ||
      formData.get("isActive") === "true",

    isFeatured:
      formData.get("isFeatured") === "on" ||
      formData.get("isFeatured") === "true",

    images: parseImages(formData.get("images")),

    tags: parseTagsInput(
      String(formData.get("tags") ?? "")
    ),

    metaTitle: formData.get("metaTitle") || null,
    metaDescription: formData.get("metaDescription") || null,

    variants: parseVariantsJson(
      formData.get("variants")
    ),
  };
}

async function syncVariants(
  productId: string,
  variants: ReturnType<typeof parseVariantsJson>,
) {
  await db.productVariant.deleteMany({ where: { productId } });

  if (variants.length === 0) return 0;

  await db.productVariant.createMany({
    data: variants.map((v, index) => ({
      productId,
      name: v.name,
      sku: v.sku || null,
      price: v.price ?? null,
      stock: v.stock,
      attributes: v.attributes,
      isActive: v.isActive,
      sortOrder: v.sortOrder ?? index,
    })),
  });

  return variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0);
}

function revalidateProductPaths(slug?: string) {
  revalidateCatalogCache();
  revalidateAnalyticsCache();
  if (slug) revalidateTag(`product:${slug}`);
  revalidatePath(ROUTES.products);
  revalidatePath(ROUTES.adminProducts);
  revalidatePath(ROUTES.adminInventory);
  revalidatePath(ROUTES.admin);
  if (slug) revalidatePath(`${ROUTES.products}/${slug}`);
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireStoreStaff();

  const rawCategoryId = formData.get("categoryId");
  if (typeof rawCategoryId !== "string" || rawCategoryId.trim() === "") {
    return { error: "Category is required" };
  }

  const category = await db.category.findUnique({
    where: { id: rawCategoryId },
  });
  if (!category) return { error: "Category not found" };

  let metadata: Record<string, string | number | boolean> = {};
  try {
    metadata = validateMetadataAgainstSchema(
      parseMetadataFromFormData(formData),
      category.attributeSchema as AttributeField[],
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid attributes" };
  }

  const parsed = productSchema.safeParse({
    ...parseProductFormData(formData),
    metadata,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug =
    data.slug ||
    (await uniqueSlug(data.name, async (s) => {
      return Boolean(await db.product.findUnique({ where: { slug: s } }));
    }));

  const variantStock = data.variants.reduce(
    (sum, v) => sum + (v.isActive ? v.stock : 0),
    0,
  );
  const stock = data.variants.length > 0 ? variantStock : data.stock;

  const product = await db.product.create({
    data: {
      name: data.name,
      slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      descriptionHtml: data.descriptionHtml || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      sku: data.sku || null,
      stock,
      lowStockThreshold: data.lowStockThreshold,
      categoryId: data.categoryId,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      images: data.images,
      metadata: data.metadata,
      tags: data.tags,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
    },
  });

  await syncVariants(product.id, data.variants);

  await logActivityForActor(actor, {
    action: ActivityAction.PRODUCT_CREATED,
    entityType: ActivityEntityType.PRODUCT,
    entityId: product.id,
    details: { productName: product.name, slug: product.slug },
  });
  revalidatePath(ROUTES.superAdminActivity);
  revalidateProductPaths(slug);
  redirect(ROUTES.adminProducts);
}

export async function updateProduct(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireStoreStaff();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { error: "Product not found" };

  const rawCategoryId = formData.get("categoryId");
  if (typeof rawCategoryId !== "string" || rawCategoryId.trim() === "") {
    return { error: "Category is required" };
  }

  const category = await db.category.findUnique({
    where: { id: rawCategoryId },
  });
  if (!category) return { error: "Category not found" };

  let metadata: Record<string, string | number | boolean> = {};
  try {
    metadata = validateMetadataAgainstSchema(
      parseMetadataFromFormData(formData),
      category.attributeSchema as AttributeField[],
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid attributes" };
  }

  const parsed = productSchema.safeParse({
    ...parseProductFormData(formData),
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

  const variantStock = data.variants.reduce(
    (sum, v) => sum + (v.isActive ? v.stock : 0),
    0,
  );
  const stock = data.variants.length > 0 ? variantStock : data.stock;

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      descriptionHtml: data.descriptionHtml || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      sku: data.sku || null,
      stock,
      lowStockThreshold: data.lowStockThreshold,
      categoryId: data.categoryId,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      images: data.images,
      metadata: data.metadata,
      tags: data.tags,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
    },
  });

  await syncVariants(id, data.variants);

  await logActivityForActor(actor, {
    action: ActivityAction.PRODUCT_UPDATED,
    entityType: ActivityEntityType.PRODUCT,
    entityId: id,
    details: { productName: data.name, slug },
  });
  revalidatePath(ROUTES.superAdminActivity);
  revalidateProductPaths(slug);
  redirect(ROUTES.adminProducts);
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const actor = await requireStoreStaff();
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  });
  if (!product) return { error: "Product not found" };

  await db.product.delete({ where: { id } });

  await logActivityForActor(actor, {
    action: ActivityAction.PRODUCT_DELETED,
    entityType: ActivityEntityType.PRODUCT,
    entityId: id,
    details: { productName: product.name, slug: product.slug },
  });
  revalidatePath(ROUTES.superAdminActivity);
  revalidateProductPaths();
  return { success: true };
}

export async function updateProductStock(
  id: string,
  stock: number,
): Promise<ActionState> {
  const actor = await requireStoreStaff();
  if (stock < 0) return { error: "Stock cannot be negative" };

  const product = await db.product.findUnique({
    where: { id },
    include: { _count: { select: { variants: true } } },
  });
  if (!product) return { error: "Product not found" };
  if (product._count.variants > 0) {
    return { error: "Update stock on variants for this product" };
  }

  await db.product.update({ where: { id }, data: { stock } });

  await logActivityForActor(actor, {
    action: ActivityAction.INVENTORY_UPDATED,
    entityType: ActivityEntityType.PRODUCT,
    entityId: id,
    details: { productName: product.name, stock, previousStock: product.stock },
  });
  revalidatePath(ROUTES.superAdminActivity);
  revalidateProductPaths(product.slug);
  return { success: true };
}

export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<ActionState> {
  const actor = await requireStoreStaff();
  if (stock < 0) return { error: "Stock cannot be negative" };

  const existingVariant = await db.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true, name: true, productId: true },
  });
  if (!existingVariant) return { error: "Variant not found" };

  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: { stock },
    include: { product: { include: { variants: true } } },
  });

  const totalStock = variant.product.variants
    .filter((v) => v.isActive)
    .reduce((sum, v) => sum + v.stock, 0);

  await db.product.update({
    where: { id: variant.productId },
    data: { stock: totalStock },
  });

  await logActivityForActor(actor, {
    action: ActivityAction.INVENTORY_UPDATED,
    entityType: ActivityEntityType.PRODUCT_VARIANT,
    entityId: variantId,
    details: {
      variantName: existingVariant.name,
      productId: existingVariant.productId,
      productName: variant.product.name,
      stock,
      previousStock: existingVariant.stock,
    },
  });
  revalidatePath(ROUTES.superAdminActivity);
  revalidateProductPaths(variant.product.slug);
  return { success: true };
}
