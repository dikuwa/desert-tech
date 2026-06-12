/**
 * POST /api/auth/clear-must-change-password
 * Clears the mustChangePassword flag after a user successfully changes their password.
 * Called by the settings page after a successful password change.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const user = await requireAuth();

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { mustChangePassword: false, passwordChangedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to clear mustChangePassword:", error);
    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to clear password change flag" },
      { status: 500 }
    );
  }
}
