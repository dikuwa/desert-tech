/**
 * POST /api/auth/update-profile
 *
 * Updates the current user's profile fields:
 * - name (display name)
 * - phone (contact number)
 * - profileEmail (profile display email, NOT login email)
 * - profileImage (profile picture URL)
 *
 * Returns a consistent JSON response:
 *   { success: true, user: { ...updatedUser } }
 * or
 *   { success: false, error: "message" }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, phone, profileEmail, profileImage, jobTitle } = body;

    // Build update data — only include fields that were actually provided
    const updateData: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof phone === "string") {
      updateData.phone = phone.trim() || null;
    }

    if (typeof profileImage === "string") {
      updateData.image = profileImage || null;
    }

    if (typeof profileEmail === "string" && profileEmail.trim()) {
      updateData.profileEmail = profileEmail.trim();
    }

    if (typeof jobTitle === "string") {
      updateData.jobTitle = jobTitle.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Update the user in the database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        image: true,
        phone: true,
        profileEmail: true,
        jobTitle: true,
        twoFactorEnabled: true,
        permissions: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        // Map name to displayName for client
        displayName: updatedUser.name,
        contactNumber: updatedUser.phone || "",
        profileImage: updatedUser.image || "",
      },
    });
  } catch (error) {
    console.error("[Profile Update] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to update profile",
      },
      { status: 500 },
    );
  }
}
