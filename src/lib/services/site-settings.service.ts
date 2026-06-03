import type { Prisma, SiteSettings } from "@prisma/client";

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

export async function ensureSiteSettings(): Promise<SiteSettings> {
  try {
    const existing = await db.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (existing) return existing;

    return await db.siteSettings.create({
      data: getDefaultSiteSettingsData(),
    });
  } catch (err: unknown) {
    // If the table doesn't exist yet (P2021), return default settings so
    // server-side rendering and builds can proceed without a live DB schema.
    if (isMissingTableError(err)) {
      return defaultSettingsRecord();
    }
    throw err;
  }
}

export async function getSiteSettingsRecord(): Promise<SiteSettings> {
  return ensureSiteSettings();
}

export async function getRuntimeSiteConfig(): Promise<RuntimeSiteConfig> {
  const settings = await getSiteSettingsRecord();
  return mapSiteSettingsToRuntime(settings);
}

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
