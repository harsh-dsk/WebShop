import { z } from "zod";

import { isValidHexColor, normalizeHexColor } from "@/lib/color-utils";

const hexColor = z
  .string()
  .min(1)
  .refine(isValidHexColor, "Invalid hex color")
  .transform(normalizeHexColor);

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

export const storeInfoSchema = z.object({
  storeName: z.string().min(1).max(120),
  storeTagline: z.string().min(1).max(200),
  storeDescription: z.string().min(1).max(5000),
  supportEmail: z.string().email(),
  supportPhone: z.string().min(3).max(40),
  storeAddress: z.string().min(1).max(500),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  linkedInUrl: optionalUrl,
  twitterUrl: optionalUrl,
});

export const brandingSchema = z.object({
  logoUrl: optionalUrl,
  logoText: z.string().min(1).max(8),
  faviconUrl: optionalUrl,
});

export const themeSchema = z.object({
  primaryColor: hexColor,
  secondaryColor: hexColor,
  accentColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  buttonColor: hexColor,
});

export const homepageSchema = z.object({
  heroEyebrow: z.string().max(120).optional().nullable(),
  heroTitle: z.string().min(1).max(200),
  heroSubtitle: z.string().min(1).max(2000),
  heroPrimaryCtaLabel: z.string().min(1).max(80),
  heroPrimaryCtaHref: z.string().min(1).max(200),
  heroSecondaryCtaLabel: z.string().max(80).optional().nullable(),
  heroSecondaryCtaHref: z.string().max(200).optional().nullable(),
  heroBackgroundImage: optionalUrl,
  showFeaturedProducts: z.coerce.boolean(),
  showCategories: z.coerce.boolean(),
  showBestSellers: z.coerce.boolean(),
  showNewsletter: z.coerce.boolean(),
});

export type StoreInfoInput = z.infer<typeof storeInfoSchema>;
export type BrandingInput = z.infer<typeof brandingSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;
export type HomepageInput = z.infer<typeof homepageSchema>;
