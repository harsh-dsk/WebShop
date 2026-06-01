"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStoreStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants/routes";
import { uniqueSlug } from "@/lib/slug";
import { categorySchema } from "@/lib/validations/category";
import type { AttributeField } from "@/types/catalog";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function parseAttributeSchema(raw: unknown): AttributeField[] {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as AttributeField[];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw as AttributeField[];
  return [];
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStoreStaff();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || null,
    imageUrl: formData.get("imageUrl") || null,
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    attributeSchema: parseAttributeSchema(formData.get("attributeSchema")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug =
    data.slug ||
    (await uniqueSlug(data.name, async (s) => {
      const found = await db.category.findUnique({ where: { slug: s } });
      return Boolean(found);
    }));

  await db.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      attributeSchema: data.attributeSchema,
    },
  });

  revalidatePath(ROUTES.categories);
  revalidatePath(ROUTES.adminCategories);
  redirect(ROUTES.adminCategories);
}

export async function updateCategory(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStoreStaff();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || null,
    imageUrl: formData.get("imageUrl") || null,
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    attributeSchema: parseAttributeSchema(formData.get("attributeSchema")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return { error: "Category not found" };

  const data = parsed.data;
  const slug = data.slug ?? existing.slug;

  const conflict = await db.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (conflict) return { error: "Slug already in use" };

  await db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      attributeSchema: data.attributeSchema,
    },
  });

  revalidatePath(ROUTES.categories);
  revalidatePath(`${ROUTES.categories}/${slug}`);
  revalidatePath(ROUTES.adminCategories);
  revalidatePath(ROUTES.products);
  redirect(ROUTES.adminCategories);
}

export async function deleteCategory(id: string): Promise<ActionState> {
  await requireStoreStaff();

  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { error: `Cannot delete: ${count} product(s) use this category` };
  }

  await db.category.delete({ where: { id } });

  revalidatePath(ROUTES.categories);
  revalidatePath(ROUTES.adminCategories);
  return { success: true };
}
