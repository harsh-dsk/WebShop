-- Idempotent migration to add Super Admin fields: Role enum, users.isBlocked, site_settings
-- Safe to run on production; uses IF NOT EXISTS checks and DO blocks for enums.

-- 1) Ensure Role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'role') THEN
    CREATE TYPE "Role" AS ENUM ('CUSTOMER','ADMIN','SUPER_ADMIN');
  END IF;
END$$;

-- 2) Add isBlocked column to users (nullable with default false)
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN DEFAULT false;

-- 3) Create site_settings table if missing
CREATE TABLE IF NOT EXISTS "site_settings" (
  id TEXT PRIMARY KEY DEFAULT 'default',
  storeName TEXT NOT NULL,
  storeTagline TEXT NOT NULL,
  storeDescription TEXT NOT NULL,
  logoUrl TEXT,
  logoText TEXT NOT NULL DEFAULT 'SF',
  faviconUrl TEXT,
  supportEmail TEXT NOT NULL,
  supportPhone TEXT NOT NULL,
  storeAddress TEXT NOT NULL,
  instagramUrl TEXT,
  facebookUrl TEXT,
  linkedInUrl TEXT,
  twitterUrl TEXT,
  primaryColor TEXT NOT NULL,
  secondaryColor TEXT NOT NULL,
  accentColor TEXT NOT NULL,
  backgroundColor TEXT NOT NULL,
  textColor TEXT NOT NULL,
  buttonColor TEXT NOT NULL,
  heroEyebrow TEXT,
  heroTitle TEXT NOT NULL,
  heroSubtitle TEXT NOT NULL,
  heroPrimaryCtaLabel TEXT NOT NULL,
  heroPrimaryCtaHref TEXT NOT NULL,
  heroSecondaryCtaLabel TEXT,
  heroSecondaryCtaHref TEXT,
  heroBackgroundImage TEXT,
  showFeaturedProducts BOOLEAN DEFAULT true,
  showCategories BOOLEAN DEFAULT true,
  showBestSellers BOOLEAN DEFAULT true,
  showNewsletter BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4) Create indexes if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_role_idx') THEN
    CREATE INDEX "users_role_idx" ON "users" ("role");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_isblocked_idx') THEN
    CREATE INDEX "users_isblocked_idx" ON "users" ("isBlocked");
  END IF;
END$$;
