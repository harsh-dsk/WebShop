import { AddressLabel } from "@prisma/client";
import { z } from "zod";

export const addressLabelSchema = z.nativeEnum(AddressLabel);

export const addressSchema = z.object({
  label: addressLabelSchema,
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number"),
  addressLine: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address is too long"),
  city: z.string().min(2, "City is required").max(100, "City name is too long"),
  state: z.string().min(2, "State is required").max(100, "State name is too long"),
  postalCode: z
    .string()
    .min(4, "Enter a valid postal code")
    .max(12, "Postal code is too long"),
  country: z
    .string()
    .min(2, "Country is required")
    .max(2, "Use a 2-letter country code")
    .default("IN"),
  isDefault: z
    .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("on")])
    .optional()
    .transform((v) => v === true || v === "true" || v === "on"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export function parseAddressFormData(formData: FormData) {
  return addressSchema.safeParse({
    label: formData.get("label"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    addressLine: formData.get("addressLine"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "IN",
    isDefault: formData.get("isDefault"),
  });
}
