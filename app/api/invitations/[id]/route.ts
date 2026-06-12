/**
 * PATCH /api/invitations/[id]
 * Update a pending invitation (name, email, role).
 * DELETE /api/invitations/[id]
 * Revoke/delete a pending invitation.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission, createAuditLog } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { InvitationStatus, UserRole } from "@/lib/enums";
import { Permissions } from "@/lib/permissions";

const updateInvitationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  phone: z.string().max(50).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await requirePermission(Permissions.USERS_INVITE);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const invitation = await db.invitation.findUnique({ where: { id } });
    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: "Can only edit pending invitations" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = updateInvitationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, role, phone } = result.data;

    // Check role permissions
    if (role === UserRole.OWNER && currentUser.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only the OWNER can assign Owner role" },
        { status: 403 }
      );
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone.trim() || null;

    const updated = await db.invitation.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      action: "invitation.updated",
      targetType: "invitation",
      targetId: id,
      targetLabel: updated.email,
      metadata: updateData,
    });

    return NextResponse.json({ success: true, invitation: updated });
  } catch (error) {
    console.error("[API] PATCH /api/invitations/[id] error:", error);
    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to update invitation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirePermission(Permissions.USERS_INVITE);

    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const invitation = await db.invitation.findUnique({ where: { id } });
    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Soft-delete: mark as REVOKED
    await db.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });

    await createAuditLog({
      action: "invitation.revoked",
      targetType: "invitation",
      targetId: id,
      targetLabel: invitation.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/invitations/[id] error:", error);
    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    );
  }
}
