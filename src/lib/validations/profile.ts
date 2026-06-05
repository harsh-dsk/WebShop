import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
