/**
 * Staff Management API
 * CRUD operations for staff users with proper permission checks.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requirePermission,
  requireRole,
  getCurrentUser,
  createAuditLog,
  revokeAllUserSessions,
  canManageUser,
} from "@/lib/auth-server";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@/lib/enums";
import { DEFAULT_ROLE_PERMISSIONS, Permissions } from "@/lib/permissions";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(10).max(128),
  role: z.nativeEnum(UserRole),
});

/**
 * GET /api/staff
 * List all staff users.
 */
export async function GET(req: NextRequest) {
  try {
    await requirePermission(Permissions.STAFF_VIEW);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (status && Object.values(UserStatus).includes(status as UserStatus)) {
      where.status = status;
    }
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      where.role = role;
    }

    // Fetch staff (exclude OWNER from list for non-OWNER users)
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== UserRole.OWNER) {
      where.role = { not: UserRole.OWNER };
    }

    const [staff, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          permissions: true,
          twoFactorEnabled: true,
          lastActiveAt: true,
          invitedById: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/staff error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff
 * Create an active user with an immediately usable password.
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await requirePermission(Permissions.STAFF_MANAGE);

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const result = createUserSchema.safeParse(await req.json());
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { name, password, role } = result.data;
    const email = result.data.email.toLowerCase().trim();

    if (role === UserRole.OWNER && currentUser.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only an Owner can create another Owner account" },
        { status: 403 },
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          role,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          permissions: DEFAULT_ROLE_PERMISSIONS[role],
          invitedById: currentUser.id,
        },
      });

      await tx.account.create({
        data: {
          userId: createdUser.id,
          providerId: "credential",
          accountId: createdUser.id,
          password: passwordHash,
        },
      });

      return createdUser;
    });

    await createAuditLog({
      action: "user.created",
      targetType: "user",
      targetId: user.id,
      targetLabel: user.email,
      metadata: { role: user.role },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/staff error:", error);
    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
