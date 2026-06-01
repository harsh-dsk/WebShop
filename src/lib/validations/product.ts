import { z } from "zod";

import type { AttributeField } from "@/types/catalog";

const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(10000).optional().nullable(),
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
});

export type ProductFormValues = z.infer<typeof productSchema>;

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
