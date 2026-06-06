import type { Prisma, SiteSettings } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import {
  getDefaultSiteSettingsData,
  mapSiteSettingsToRuntime,
  type RuntimeSiteConfig,
} from "@/lib/site-runtime";

function isMissingTableError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2021"
  );
}

function defaultSettingsRecord(): SiteSettings {
  const data = getDefaultSiteSettingsData();
  return {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SiteSettings;
}

async function fetchSiteSettingsRecord(): Promise<SiteSettings> {
  try {
    const existing = await db.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (existing) return existing;

    return await db.siteSettings.create({
      data: getDefaultSiteSettingsData(),
    });
  } catch (err: unknown) {
    if (isMissingTableError(err)) {
      return defaultSettingsRecord();
    }
    throw err;
  }
}

const getCachedSiteSettingsRecord = unstable_cache(
  fetchSiteSettingsRecord,
  ["site-settings-record"],
  {
    tags: [CACHE_TAGS.siteSettings],
    revalidate: 300,
  },
);

export async function ensureSiteSettings(): Promise<SiteSettings> {
  return fetchSiteSettingsRecord();
}

export const getSiteSettingsRecord = unstable_cache(
  async (): Promise<SiteSettings> => getCachedSiteSettingsRecord(),
  ["site-settings-record"],
  {
    tags: [CACHE_TAGS.siteSettings],
    revalidate: 300,
  },
);

export const getRuntimeSiteConfig = unstable_cache(
  async (): Promise<RuntimeSiteConfig> => {
    const settings = await getSiteSettingsRecord();
    return mapSiteSettingsToRuntime(settings);
  },
  ["runtime-site-config"],
  {
    tags: [CACHE_TAGS.siteSettings],
    revalidate: 300,
  },
);

export async function updateSiteSettings(
  data: Prisma.SiteSettingsUpdateInput,
): Promise<SiteSettings> {
  await ensureSiteSettings();
  try {
    return await db.siteSettings.update({
      where: { id: "default" },
      data,
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      throw new Error(
        "Site settings table is missing. Run: npm run db:migrate:deploy",
      );
    }
    throw err;
  }
}
