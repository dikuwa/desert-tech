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
import { Permissions } from "@/lib/permissions";
import { sendAccountStatusEmail } from "@/lib/email";

// Validation schemas
const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  permissions: z.array(z.string()).optional(),
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
