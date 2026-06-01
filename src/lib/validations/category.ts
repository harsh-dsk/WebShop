import { z } from "zod";

const attributeFieldSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/i, "Key must be alphanumeric"),
  label: z.string().min(1),
  type: z.enum(["text", "number", "select"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(5000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  attributeSchema: z.array(attributeFieldSchema).default([]),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
