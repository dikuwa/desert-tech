/**
 * POST /api/invitations/[id]/revoke
 * Revoke a pending invitation.
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission, createAuditLog } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { InvitationStatus } from "@/lib/enums";
import { Permissions } from "@/lib/permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirePermission(Permissions.USERS_INVITE);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const invitation = await db.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: "Can only revoke pending invitations" },
        { status: 400 }
      );
    }

    await db.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });

    await createAuditLog({
      action: "invitation.revoked",
      targetType: "invitation",
      targetId: id,
      targetLabel: invitation.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /api/invitations/[id]/revoke error:", error);
    return NextResponse.json(
      { error: "Failed to revoke invitation" },
      { status: 500 }
    );
  }
}
