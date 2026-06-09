-- Migration: Add profileEmail field to User model
-- Stores a display-only email for profile settings, separate from login email

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "profileEmail" TEXT;
