-- Add nullable address fields to users without altering existing data
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "fullName" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "state" TEXT,
  ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
