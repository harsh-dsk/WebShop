import { z } from "zod";

export const expectedDeliverySchema = z.object({
  expectedDeliveryDate: z
    .string()
    .min(1, "Expected delivery date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
});

export type ExpectedDeliveryInput = z.infer<typeof expectedDeliverySchema>;

