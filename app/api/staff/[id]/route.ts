/**
 * Staff Member API - Get, update, delete individual staff member.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requirePermission,
  requireRole,
  createAuditLog,
  revokeAllUserSessions,
  canManageUser,
  getCurrentUser,
} from "@/lib/auth-server";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@/lib/enums";
import { Permissions, type Permission } from "@/lib/permissions";
import { sendAccountStatusEmail } from "@/lib/email";

// Validation schema for updates
const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  permissions: z.array(z.enum(Object.values(Permissions) as [Permission, ...Permission[]])).optional(),
});

/**
 * GET /api/staff/[id]
 * Get a specific staff member.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirePermission(Permissions.STAFF_VIEW);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if can view this user
    const currentUser = await getCurrentUser();
    if (user.role === UserRole.OWNER && currentUser?.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Cannot view OWNER" },
        { status: 403 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[API] GET /api/staff/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff member" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/staff/[id]
 * Update a staff member.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await requirePermission(Permissions.STAFF_MANAGE);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Check if can manage this user
    const canManage = await canManageUser(id);
    if (!canManage) {
      return NextResponse.json(
        { error: "Cannot modify this user" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await req.json();
    const result = updateStaffSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, role, status, permissions } = result.data;

    if (id === currentUser.id && (role || status || permissions)) {
      return NextResponse.json(
        { error: "Role, status, and permission changes require another authorized administrator" },
        { status: 403 }
      );
    }

    // Get current user data for audit log
    const targetUser = await db.user.findUnique({
      where: { id },
      select: { name: true, email: true, role: true, status: true, permissions: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.role === UserRole.OWNER) {
      return NextResponse.json(
        { error: "The OWNER account cannot be modified through staff management" },
        { status: 403 }
      );
    }

    // Prevent granting OWNER role
    if (role === UserRole.OWNER && currentUser.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only OWNER can grant OWNER role" },
        { status: 403 }
      );
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(status && { status }),
        ...(permissions && { permissions: permissions as any }),
      },
    });

    // Handle status change side effects
    if (status === UserStatus.SUSPENDED) {
      // Revoke all sessions
      await revokeAllUserSessions(id);

      // Send email notification
      try {
        await sendAccountStatusEmail({
          to: targetUser.email,
          name: targetUser.name,
          status: "suspended",
        });
      } catch (emailError) {
        console.error("[API] Failed to send suspension email:", emailError);
      }
    } else if (status === UserStatus.ACTIVE && targetUser.status === UserStatus.SUSPENDED) {
      // Send reactivation email
      try {
        await sendAccountStatusEmail({
          to: targetUser.email,
          name: targetUser.name,
          status: "reactivated",
        });
      } catch (emailError) {
        console.error("[API] Failed to send reactivation email:", emailError);
      }
    }

    // Create audit log
    await createAuditLog({
      action: "user.updated",
      targetType: "user",
      targetId: id,
      targetLabel: targetUser.name,
      beforeValues: {
        name: targetUser.name,
        role: targetUser.role,
        status: targetUser.status,
        permissions: targetUser.permissions,
      },
      afterValues: {
        name: name || targetUser.name,
        role: role || targetUser.role,
        status: status || targetUser.status,
        permissions: permissions || targetUser.permissions,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[API] PATCH /api/staff/[id] error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/staff/[id]
 * Disable (soft delete) a staff member.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirePermission(Permissions.STAFF_MANAGE);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Check if can manage this user
    const canManage = await canManageUser(id);
    if (!canManage) {
      return NextResponse.json(
        { error: "Cannot modify this user" },
        { status: 403 }
      );
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.role === UserRole.OWNER) {
      return NextResponse.json(
        { error: "The OWNER account cannot be disabled" },
        { status: 403 }
      );
    }

    // Soft delete by disabling account
    await db.user.update({
      where: { id },
      data: { status: UserStatus.DISABLED },
    });

    // Revoke all sessions
    await revokeAllUserSessions(id);

    // Create audit log
    await createAuditLog({
      action: "user.disabled",
      targetType: "user",
      targetId: id,
      targetLabel: targetUser.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/staff/[id] error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to disable staff" },
      { status: 500 }
    );
  }
}
