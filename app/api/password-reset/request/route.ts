/**
 * POST /api/password-reset/request
 * Request a password reset email.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth-server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import { getStoreSettings } from "@/lib/store-settings";

const requestSchema = z.object({
  email: z.string().email("Valid email required"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit by email (prevent enumeration but still limit)
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit by IP
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit("forgot-password", `${clientIP}:${normalizedEmail}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
    }

    // Create reset token (returns null if user doesn't exist)
    const resetData = await createPasswordResetToken(normalizedEmail);

    // Send email if user exists
    if (resetData) {
      try {
        const storeSettings = await getStoreSettings();
        await sendPasswordResetEmail({
          to: resetData.email,
          token: resetData.token,
          storeName: storeSettings.storeName,
        });
      } catch (emailError) {
        console.error("[API] Failed to send password reset email:", emailError);
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("[API] POST /api/password-reset/request error:", error);

    // Still return generic success to prevent enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  }
}
