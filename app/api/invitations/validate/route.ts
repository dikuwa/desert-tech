/**
 * GET /api/invitations/validate?token=...
 * Validate an invitation token without accepting it.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateInvitationToken } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token required" },
        { status: 400 }
      );
    }

    const invitation = await validateInvitationToken(token);

    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired invitation" },
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
