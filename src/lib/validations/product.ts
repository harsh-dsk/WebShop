import { z } from "zod";

import type { AttributeField } from "@/types/catalog";

const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  sku: z.string().max(64).optional().nullable(),
  price: z.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  attributes: z.record(z.string()).default({}),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  descriptionHtml: z.string().max(50000).optional().nullable(),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().max(64).optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  categoryId: z.string().min(1),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  images: z.array(productImageSchema).default([]),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
  tags: z.array(z.string().min(1).max(40)).default([]),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  variants: z.array(variantSchema).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

export function parseVariantsJson(raw: unknown): z.infer<typeof variantSchema>[] {
  if (typeof raw === "string") {
    try {
      return variantSchema.array().parse(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return variantSchema.array().parse(raw);
  }
  return [];
}

export function validateMetadataAgainstSchema(
  metadata: Record<string, unknown>,
  schema: AttributeField[],
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const field of schema) {
    const raw = metadata[field.key];
    if (raw === undefined || raw === null || raw === "") {
      if (field.required) {
        throw new Error(`${field.label} is required`);
      }
      continue;
    }

    if (field.type === "number") {
      const num = Number(raw);
      if (Number.isNaN(num)) {
        throw new Error(`${field.label} must be a number`);
      }
      result[field.key] = num;
    } else {
      result[field.key] = String(raw);
    }
  }

  return result;
}
