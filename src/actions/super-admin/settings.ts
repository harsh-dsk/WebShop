"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/orders";
import { requireSuperAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { updateSiteSettings } from "@/lib/services/site-settings.service";
import {
  brandingSchema,
  homepageSchema,
  storeInfoSchema,
  themeSchema,
} from "@/lib/validations/site-settings";

function revalidateSitePaths() {
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.superAdminSettings);
  revalidatePath(ROUTES.superAdminTheme);
  revalidatePath(ROUTES.superAdminBranding);
  revalidatePath("/", "layout");
}

export async function updateStoreInfo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = storeInfoSchema.safeParse({
    storeName: formData.get("storeName"),
    storeTagline: formData.get("storeTagline"),
    storeDescription: formData.get("storeDescription"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
    storeAddress: formData.get("storeAddress"),
    instagramUrl: formData.get("instagramUrl"),
    facebookUrl: formData.get("facebookUrl"),
    linkedInUrl: formData.get("linkedInUrl"),
    twitterUrl: formData.get("twitterUrl"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? "Invalid store information",
    };
  }

  await updateSiteSettings(parsed.data);
  revalidateSitePaths();
  return { success: true };
}

export async function updateBranding(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = brandingSchema.safeParse({
    logoUrl: formData.get("logoUrl"),
    logoText: formData.get("logoText"),
    faviconUrl: formData.get("faviconUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid branding" };
  }

  await updateSiteSettings(parsed.data);
  revalidateSitePaths();
  return { success: true };
}

export async function updateTheme(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = themeSchema.safeParse({
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    accentColor: formData.get("accentColor"),
    backgroundColor: formData.get("backgroundColor"),
    textColor: formData.get("textColor"),
    buttonColor: formData.get("buttonColor"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid theme colors" };
  }

  await updateSiteSettings(parsed.data);
  revalidateSitePaths();
  return { success: true };
}

export async function updateHomepage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = homepageSchema.safeParse({
    heroEyebrow: formData.get("heroEyebrow") || null,
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    heroPrimaryCtaLabel: formData.get("heroPrimaryCtaLabel"),
    heroPrimaryCtaHref: formData.get("heroPrimaryCtaHref"),
    heroSecondaryCtaLabel: formData.get("heroSecondaryCtaLabel") || null,
    heroSecondaryCtaHref: formData.get("heroSecondaryCtaHref") || null,
    heroBackgroundImage: formData.get("heroBackgroundImage"),
    showFeaturedProducts: formData.get("showFeaturedProducts") === "on",
    showCategories: formData.get("showCategories") === "on",
    showBestSellers: formData.get("showBestSellers") === "on",
    showNewsletter: formData.get("showNewsletter") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid homepage" };
  }

  await updateSiteSettings(parsed.data);
  revalidateSitePaths();
  return { success: true };
}
