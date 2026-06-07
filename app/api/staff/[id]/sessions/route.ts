/**
 * Staff Sessions API - Manage user sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission, getCurrentUser, createAuditLog, revokeAllUserSessions } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { Permissions } from "@/lib/permissions";

/**
 * DELETE /api/staff/[id]/sessions
 * Revoke all sessions for a user.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await requirePermission(Permissions.USERS_EDIT);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Get target user
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

    // Prevent revoking OWNER sessions unless you're OWNER
    if (targetUser.role === "OWNER" && currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Cannot revoke OWNER sessions" },
        { status: 403 }
      );
    }

    // Revoke all sessions
    await revokeAllUserSessions(id);

    // Create audit log
    await createAuditLog({
      action: "user.sessions_revoked",
      targetType: "user",
      targetId: id,
      targetLabel: targetUser.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/staff/[id]/sessions error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/staff/[id]/sessions
 * Get active sessions for a user.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await requirePermission(Permissions.USERS_VIEW);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Only allow viewing own sessions unless staff:manage permission
    if (id !== currentUser.id) {
      await requirePermission(Permissions.USERS_EDIT);
    }

    const sessions = await db.session.findMany({
      where: {
        userId: id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[API] GET /api/staff/[id]/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
