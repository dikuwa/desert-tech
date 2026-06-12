/**
 * POST /api/staff/[id]/send-password-reset
 * Sends a password reset token to the user via email and WhatsApp.
 * Requires USERS_EDIT permission.
 */

import { NextRequest, NextResponse } from "next/server";
import { requirePermission, canManageUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { Permissions } from "@/lib/permissions";
import { sendPasswordResetEmail } from "@/lib/email";
import { sendPasswordResetWhatsApp } from "@/lib/whatsapp";
import { getStoreSettings } from "@/lib/store-settings";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requirePermission(Permissions.USERS_EDIT);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 },
      );
    }

    const canManage = await canManageUser(id);
    if (!canManage) {
      return NextResponse.json(
        { error: "Cannot manage this user" },
        { status: 403 },
      );
    }

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a reset token manually
    const token = crypto.randomUUID();
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store the hashed token with the user's email
    await db.passwordReset.create({
      data: {
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });

    const storeSettings = await getStoreSettings();

    // Send email
    await sendPasswordResetEmail({ to: user.email, token, storeName: storeSettings.storeName });

    // Send WhatsApp if phone is available
    if (user.phone) {
      const phoneClean = user.phone.replace(/^\+/, "");
      await sendPasswordResetWhatsApp(phoneClean, user.name, token, storeSettings.storeName);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] POST /api/staff/[id]/send-password-reset error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to send password reset" },
      { status: 500 },
    );
  }
}
