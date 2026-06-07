/**
 * POST /api/invitations/accept
 * Accept an invitation and create user account.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { acceptInvitation } from "@/lib/auth-server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const acceptInvitationSchema = z.object({
  token: z.string().min(10, "Invalid token"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit("invitation-accept", clientIP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
    }

    // Parse and validate body
    const body = await req.json();
    const result = acceptInvitationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { token, name, password } = result.data;

    // Accept invitation
    const { user } = await acceptInvitation({
      token,
      name,
      password,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[API] POST /api/invitations/accept error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Invalid or expired")) {
        return NextResponse.json(
          { error: "Invalid or expired invitation" },
          { status: 400 }
        );
      }
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
