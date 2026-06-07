ALTER TABLE "Session"
  ADD COLUMN IF NOT EXISTS "impersonatedBy" TEXT;
