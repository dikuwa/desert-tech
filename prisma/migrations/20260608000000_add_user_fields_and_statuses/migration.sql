-- Migration: Add new User fields and statuses
-- Adds: mustChangePassword, jobTitle, phone, passwordChangedAt, deletedAt
-- Adds: LOCKED and DELETED to UserStatus enum

-- Extend UserStatus enum with LOCKED and DELETED
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'LOCKED';
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'DELETED';

-- Add new columns to User table
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "jobTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
