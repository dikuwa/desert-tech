/**
 * POST /api/invitations/[id]/resend
 * Resend an invitation via email and/or WhatsApp.
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission, createAuditLog, getCurrentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { InvitationStatus } from "@/lib/enums";
import { Permissions } from "@/lib/permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sendInvitationEmail } from "@/lib/email";
import { sendInvitationWhatsApp } from "@/lib/whatsapp";

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

    // Parse optional phone from request body for WhatsApp resend
    let phone: string | undefined;
    try {
      const body = await req.json();
      phone = body.phone?.replace?.(/^\+/, "") || undefined;
    } catch {
      // No body or invalid JSON — email-only resend is fine
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

    // Send WhatsApp if phone provided
    if (phone) {
      try {
        await sendInvitationWhatsApp(
          phone,
          invitation.name,
          token,
          invitation.role,
          currentUser.name,
        );
      } catch (waError) {
        console.error("[API] Failed to send WhatsApp on resend:", waError);
      }
    }

    await createAuditLog({
      action: "invitation.resent",
      targetType: "invitation",
      targetId: id,
      targetLabel: invitation.email,
      metadata: { sentViaWhatsApp: !!phone },
    });

    const sentVia = phone ? "Email & WhatsApp" : "Email";
    return NextResponse.json({ success: true, message: `Invitation resent via ${sentVia}` });
  } catch (error) {
    console.error("[API] POST /api/invitations/[id]/resend error:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}
