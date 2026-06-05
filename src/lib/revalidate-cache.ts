import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";

export function revalidateSiteSettingsCache() {
  revalidateTag(CACHE_TAGS.siteSettings);
}

export function revalidateCategoriesCache() {
  revalidateTag(CACHE_TAGS.categories);
}

export function revalidateCatalogCache() {
  revalidateTag(CACHE_TAGS.catalog);
}

export function revalidateAnalyticsCache() {
  revalidateTag(CACHE_TAGS.analytics);
}

export function revalidateActivitySummaryCache() {
  revalidateTag(CACHE_TAGS.activitySummary);
}

export function revalidateAllPublicContentCache() {
  revalidateSiteSettingsCache();
  revalidateCategoriesCache();
  revalidateCatalogCache();
}
