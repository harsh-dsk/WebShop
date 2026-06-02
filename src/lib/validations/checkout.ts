import { z } from "zod";

export const checkoutSchema = z.object({
  shippingName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long"),
  shippingEmail: z.string().email("Enter a valid email address"),
  shippingPhone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number"),
  shippingAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address is too long"),
  shippingCity: z
    .string()
    .min(2, "City is required")
    .max(100, "City name is too long"),
  shippingState: z
    .string()
    .min(2, "State is required")
    .max(100, "State name is too long"),
  shippingPostalCode: z
    .string()
    .min(4, "Enter a valid postal code")
    .max(12, "Postal code is too long"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function parseCheckoutFormData(formData: FormData) {
  return checkoutSchema.safeParse({
    shippingName: formData.get("shippingName"),
    shippingEmail: formData.get("shippingEmail"),
    shippingPhone: formData.get("shippingPhone"),
    shippingAddress: formData.get("shippingAddress"),
    shippingCity: formData.get("shippingCity"),
    shippingState: formData.get("shippingState"),
    shippingPostalCode: formData.get("shippingPostalCode"),
  });
}
