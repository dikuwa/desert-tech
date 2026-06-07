/**
 * Better Auth API Handler
 * Handles all authentication endpoints including:
 * - Sign in/out
 * - Session management
 * - Email verification
 * - Password reset
 * - Two-factor authentication
 */

import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handle all auth requests through Better Auth.
 * Better Auth automatically handles:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/get-session
 * - POST /api/auth/verify-email
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password
 * - POST /api/auth/two-factor/enable
 * - POST /api/auth/two-factor/verify
 * - And more...
 */
export async function GET(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error) {
    console.error("[Auth] GET error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error) {
    console.error("[Auth] POST error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods that Better Auth might use
export async function PUT(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error) {
    console.error("[Auth] PUT error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error) {
    console.error("[Auth] DELETE error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error) {
    console.error("[Auth] PATCH error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}
