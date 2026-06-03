-- AlterTable: user blocking for Super Admin user management
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_isBlocked_idx" ON "users"("isBlocked");

-- CreateTable: singleton site settings for CMS
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeTagline" TEXT NOT NULL,
    "storeDescription" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoText" TEXT NOT NULL DEFAULT 'SF',
    "faviconUrl" TEXT,
    "supportEmail" TEXT NOT NULL,
    "supportPhone" TEXT NOT NULL,
    "storeAddress" TEXT NOT NULL,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "linkedInUrl" TEXT,
    "twitterUrl" TEXT,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "buttonColor" TEXT NOT NULL,
    "heroEyebrow" TEXT,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroPrimaryCtaLabel" TEXT NOT NULL,
    "heroPrimaryCtaHref" TEXT NOT NULL,
    "heroSecondaryCtaLabel" TEXT,
    "heroSecondaryCtaHref" TEXT,
    "heroBackgroundImage" TEXT,
    "showFeaturedProducts" BOOLEAN NOT NULL DEFAULT true,
    "showCategories" BOOLEAN NOT NULL DEFAULT true,
    "showBestSellers" BOOLEAN NOT NULL DEFAULT true,
    "showNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
