import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import { UserRole, UserStatus } from "@/lib/enums";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions";

export const SYSTEM_USERS = [
  {
    name: "Desert Technology Owner",
    email: "owner@deserttech.com",
    password: process.env.DESERTTECH_OWNER_PASSWORD || "Root#2027",
    role: UserRole.OWNER,
  },
  {
    name: "Desert Technology Admin",
    email: "admin@deserttech.com",
    password: process.env.DESERTTECH_ADMIN_PASSWORD || "Admin#2027",
    role: UserRole.ADMIN,
  },
  {
    name: "Desert Technology Staff",
    email: "staff@deserttech.com",
    password: process.env.DESERTTECH_STAFF_PASSWORD || "Staff#2027",
    role: UserRole.STAFF,
  },
] as const;

export async function ensureSystemUsers(
  prisma: PrismaClient,
  options: { resetPasswords?: boolean } = {},
) {
  for (const systemUser of SYSTEM_USERS) {
    const existingUser = await prisma.user.findUnique({
      where: { email: systemUser.email },
      select: { name: true, role: true },
    });
    const isLegacySeed =
      Boolean(existingUser) &&
      (existingUser?.name !== systemUser.name || existingUser.role !== systemUser.role);

    const user = await prisma.user.upsert({
      where: { email: systemUser.email },
      update: {
        name: systemUser.name,
        role: systemUser.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        permissions: DEFAULT_ROLE_PERMISSIONS[systemUser.role],
        ...((options.resetPasswords || isLegacySeed) && { twoFactorEnabled: false }),
      },
      create: {
        name: systemUser.name,
        email: systemUser.email,
        role: systemUser.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        permissions: DEFAULT_ROLE_PERMISSIONS[systemUser.role],
      },
    });

    const credential = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
      select: { id: true },
    });

    if (!credential || options.resetPasswords || isLegacySeed) {
      const password = await bcrypt.hash(systemUser.password, 12);
      await prisma.$transaction([
        prisma.account.deleteMany({
          where: { userId: user.id, providerId: "credential" },
        }),
        prisma.account.create({
          data: {
            userId: user.id,
            providerId: "credential",
            accountId: user.id,
            password,
          },
        }),
        ...(options.resetPasswords || isLegacySeed
          ? [
              prisma.session.deleteMany({ where: { userId: user.id } }),
              prisma.twoFactor.deleteMany({ where: { userId: user.id } }),
            ]
          : []),
      ]);
    }
  }
}
