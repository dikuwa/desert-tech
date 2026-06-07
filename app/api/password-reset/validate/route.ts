/**
 * GET /api/password-reset/validate?token=...
 * Validate a password reset token.
 */

import { NextRequest, NextResponse } from "next/server";
import { validatePasswordResetToken } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token required" },
        { status: 400 }
      );
    }

    const reset = await validatePasswordResetToken(token);

    if (!reset) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 200 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[API] GET /api/password-reset/validate error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate token" },
      { status: 500 }
    );
  }
}
