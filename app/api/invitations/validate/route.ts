/**
 * GET /api/invitations/validate?token=... or ?code=...
 * Validate an invitation token or short code without accepting it.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateInvitationToken, findInvitationByShortCode, hashToken } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const code = searchParams.get("code");

    // Support both token and short code lookup
    const invitation = token
      ? await validateInvitationToken(token)
      : code
      ? await findInvitationByShortCode(code.toUpperCase())
      : null;

    if (!invitation) {
      // Determine the specific reason for failure
      let errorMsg = "Invalid invitation link.";
      if (code && db) {
        const existing = await db.invitation.findUnique({
          where: { shortCode: code.toUpperCase() },
          select: { status: true, expiresAt: true },
        });
        if (existing) {
          if (existing.status === "ACCEPTED") {
            errorMsg = "This invitation has already been accepted. Please log in.";
          } else if (existing.expiresAt < new Date() || existing.status === "EXPIRED") {
            errorMsg = "This invitation has expired. Please ask an admin to resend it.";
          }
        }
      } else if (token) {
        if (db) {
          const tokenHash = await hashToken(token);
          const existing = await db.invitation.findUnique({
            where: { tokenHash },
            select: { status: true, expiresAt: true },
          });
          if (existing) {
            if (existing.status === "ACCEPTED") {
              errorMsg = "This invitation has already been accepted. Please log in.";
            } else if (existing.expiresAt < new Date() || existing.status === "EXPIRED") {
              errorMsg = "This invitation has expired. Please ask an admin to resend it.";
            }
          }
        }
      }
      return NextResponse.json(
        { valid: false, error: errorMsg },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedBy,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/invitations/validate error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invitation" },
      { status: 500 }
    );
  }
}
