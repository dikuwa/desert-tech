/**
 * Invitations API - Create, list, resend, and revoke staff invitations.
 * Protected by staff:manage permission.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  requirePermission,
  createInvitation,
  createAuditLog,
  getCurrentUser,
} from "@/lib/auth-server";
import { db } from "@/lib/db";
import { InvitationStatus, UserRole } from "@/lib/enums";
import { Permissions, type Permission } from "@/lib/permissions";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sendInvitationEmail } from "@/lib/email";

// Validation schema for creating invitations
const createInvitationSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([UserRole.ADMIN, UserRole.STAFF]),
  permissions: z.array(z.enum(Object.values(Permissions) as [Permission, ...Permission[]])).optional(),
  note: z.string().optional(),
});

/**
 * GET /api/invitations
 * List all invitations (with pagination)
 */
export async function GET(req: NextRequest) {
  try {
    // Check permission
    await requirePermission(Permissions.STAFF_VIEW);

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (status && Object.values(InvitationStatus).includes(status as InvitationStatus)) {
      where.status = status;
    }

    // Fetch invitations
    const [invitations, total] = await Promise.all([
      db.invitation.findMany({
        where,
        include: {
          invitedBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.invitation.count({ where }),
    ]);

    return NextResponse.json({
      invitations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/invitations error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invitations
 * Create a new staff invitation
 */
export async function POST(req: NextRequest) {
  try {
    // Check permission
    const currentUser = await requirePermission(Permissions.STAFF_MANAGE);

    // Rate limit by IP
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit("invitation-create", clientIP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Parse and validate body
    const body = await req.json();
    const result = createInvitationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, name, role, permissions, note } = result.data;

    if (role === UserRole.ADMIN && currentUser.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only the OWNER can invite administrators" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Check for pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 409 }
      );
    }

    // Create invitation
    const { invitation, token } = await createInvitation({
      email,
      name,
      role,
      permissions: permissions as any,
      invitedById: currentUser.id,
      note,
    });

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: email,
        name,
        inviterName: currentUser.name,
        token,
        role,
        note,
      });
    } catch (emailError) {
      console.error("[API] Failed to send invitation email:", emailError);
      // Don't fail the request if email fails - admin can resend
    }

    return NextResponse.json(
      { invitation, message: "Invitation created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/invitations error:", error);

    if (error instanceof Error && error.message.includes("Permission")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
