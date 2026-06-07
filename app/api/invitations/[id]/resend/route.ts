/**
 * POST /api/invitations/[id]/resend
 * Resend an invitation email.
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission, createAuditLog, getCurrentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { InvitationStatus } from "@/lib/enums";
import { Permissions } from "@/lib/permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await requirePermission(Permissions.USERS_INVITE);

    // Rate limit
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit("invitation-resend", `${clientIP}:${id}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
    }

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
        { error: "Can only resend pending invitations" },
        { status: 400 }
      );
    }

    // Generate new token
    const { generateInvitationToken, hashToken } = await import("@/lib/auth-server");
    const token = generateInvitationToken();
    const tokenHash = await hashToken(token);

    // Update expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await db.invitation.update({
      where: { id },
      data: { tokenHash, expiresAt },
    });

    // Send email
    await sendInvitationEmail({
      to: invitation.email,
      name: invitation.name,
      inviterName: currentUser.name,
      token,
      role: invitation.role,
    });

    await createAuditLog({
      action: "invitation.resent",
      targetType: "invitation",
      targetId: id,
      targetLabel: invitation.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /api/invitations/[id]/resend error:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}
