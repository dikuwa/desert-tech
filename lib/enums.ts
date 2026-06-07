/**
 * Enums for Desert Tech Auth System
 * Temporary file until Prisma generates the actual enums
 */

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

export enum UserStatus {
  INVITED = "INVITED",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DISABLED = "DISABLED",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

export function normalizeUserRole(role: string): UserRole {
  const normalized = role.toUpperCase();
  if (normalized === UserRole.OWNER) return UserRole.OWNER;
  if (normalized === UserRole.ADMIN) return UserRole.ADMIN;
  return UserRole.STAFF;
}

export function normalizeUserStatus(status: string): UserStatus {
  const normalized = status.toUpperCase();
  if (normalized === UserStatus.SUSPENDED) return UserStatus.SUSPENDED;
  if (normalized === UserStatus.DISABLED) return UserStatus.DISABLED;
  if (normalized === UserStatus.INVITED) return UserStatus.INVITED;
  return UserStatus.ACTIVE;
}
