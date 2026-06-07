/**
 * POST /api/staff/[id]/reset-2fa
 * Resets another user's two-factor authentication.
 * Requires USERS_EDIT permission.
 * Deletes the user's TwoFactor record and sets twoFactorEnabled to false.
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission, canManageUser, createAuditLog, getCurrentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { Permissions } from "@/lib/permissions";
import { sendTwoFactorEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentUser = await requirePermission(Permissions.USERS_EDIT);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 },
      );
    }

    const canManage = await canManageUser(id);
    if (!canManage) {
      return NextResponse.json(
        { error: "Cannot manage this user" },
        { status: 403 },
      );
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete TwoFactor record and update user
    await db.$transaction([
      db.twoFactor.deleteMany({ where: { userId: id } }),
      db.user.update({
        where: { id },
        data: { twoFactorEnabled: false },
      }),
    ]);

    // Send notification email
    try {
      await sendTwoFactorEmail({
        to: targetUser.email,
        name: targetUser.name,
        action: "reset",
        resetBy: currentUser.email,
      });
    } catch (emailError) {
      console.error("[reset-2fa] Failed to send email:", emailError);
    }

    await createAuditLog({
      action: "user.2fa_reset",
      targetType: "user",
      targetId: id,
      targetLabel: targetUser.name,
      metadata: { resetBy: currentUser.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /api/staff/[id]/reset-2fa error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to reset 2FA" },
      { status: 500 },
    );
  }
}
