/**
 * POST /api/invitations/[id]/resend
 * Resend an invitation via email.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requirePermission,
  createAuditLog,
  ensureUniqueShortCode,
  generateInvitationToken,
  hashToken,
} from "@/lib/auth-server";
import { db } from "@/lib/db";
import { InvitationStatus } from "@/lib/enums";
import { Permissions } from "@/lib/permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sendInvitationEmail } from "@/lib/email";
import { getStoreSettings } from "@/lib/store-settings";
import { getAppUrl } from "@/lib/app-url";

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
        { error: "Please wait before resending this invitation.", retryAfter: rateLimit.retryAfter },
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

    // Check body for mode — WhatsApp-only requests should not send email
    let whatsappOnly = false;
    try {
      const body = await req.json();
      whatsappOnly = body?.whatsappOnly === true || !!body?.phone;
    } catch {
      // No body or invalid JSON — full resend with email
    }

    // Generate new token
    const token = generateInvitationToken();
    const tokenHash = await hashToken(token);
    const shortCode = invitation.shortCode || await ensureUniqueShortCode();

    // Update expiry (resets the 48-hour window)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await db.invitation.update({
      where: { id },
      data: { tokenHash, shortCode, expiresAt },
      // updatedAt is auto-updated by Prisma's @updatedAt
    });

    const appUrl = getAppUrl();
    const acceptUrl = `${appUrl}/invite/${shortCode}`;

    // If WhatsApp-only, skip email and just return the accept URL
    if (whatsappOnly) {
      await createAuditLog({
        action: "invitation.link_generated",
        targetType: "invitation",
        targetId: id,
        targetLabel: invitation.email,
        metadata: {
          method: "whatsapp",
          emailSent: false,
        },
      });

      return NextResponse.json({
        success: true,
        acceptUrl,
        message: "Invite link generated. Share it via WhatsApp.",
        whatsappOnly: true,
      });
    }

    // Send email — catch provider errors so the audit log is still written
    let emailSent = false;
    let emailError: string | null = null;

    const isDevFallback = !process.env.RESEND_API_KEY;

    if (isDevFallback) {
      console.log("\n========== INVITATION EMAIL (Development Mode) ==========");
      console.log(`To: ${invitation.email}`);
      console.log(`Name: ${invitation.name}`);
      console.log(`Accept URL: ${acceptUrl}`);
      console.log("========================================================\n");
      emailSent = true;
    } else {
      try {
        const storeSettings = await getStoreSettings();
        await sendInvitationEmail({
          to: invitation.email,
          name: invitation.name,
          inviterName: currentUser.name,
          code: shortCode,
          role: invitation.role,
          storeName: storeSettings.storeName,
        });
        emailSent = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown email error";
        emailError = message;
        console.error("[API] Failed to send invitation email:", message);
      }
    }

    // Record the resend in the audit log regardless of email success
    await createAuditLog({
      action: "invitation.resent",
      targetType: "invitation",
      targetId: id,
      targetLabel: invitation.email,
      metadata: {
        emailSent,
        emailError,
      },
    });

    if (emailError) {
      return NextResponse.json({
        success: false,
        error: "The invitation email could not be sent. Please try again.",
        acceptUrl,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      acceptUrl,
      message: isDevFallback
        ? "Invitation link generated (development mode — check server console)"
        : "Invitation email resent successfully.",
      devMode: isDevFallback,
    });
  } catch (error) {
    if (error instanceof Error &&
      (error.message.includes("Permission") ||
       error.message.includes("Rate limit"))) {
      throw error;
    }

    console.error("[API] POST /api/invitations/[id]/resend error:", error);
    return NextResponse.json(
      { error: "The invitation email could not be sent. Please try again." },
      { status: 500 }
    );
  }
}
