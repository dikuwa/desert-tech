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
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([UserRole.ADMIN, UserRole.STAFF]),
  permissions: z.array(z.enum(Object.values(Permissions) as [Permission, ...Permission[]])).optional(),
  note: z.string().optional(),
  phone: z.string().max(50).optional(),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone number is required",
});

/**
 * GET /api/invitations
 * List all invitations (with pagination)
 */
export async function GET(req: NextRequest) {
  try {
    // Check permission
    await requirePermission(Permissions.USERS_VIEW);

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
    const currentUser = await requirePermission(Permissions.USERS_INVITE);

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

    const { email: rawEmail, name, role, permissions, note, phone } = result.data;

    // If no email provided but phone is, use a unique placeholder
    const email = rawEmail || `wa-${(phone || "").replace(/[^\d]/g, "")}@invite.desertechnam.com`;

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

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const acceptUrl = `${appUrl}/invite/${invitation.shortCode}`;

    // Send invitation via email (only if an actual email was provided)
    let emailSent = false;
    let warning: string | null = null;

    if (rawEmail) {
      try {
        await sendInvitationEmail({
          to: email,
          name,
          inviterName: currentUser.name,
          code: invitation.shortCode,
          role,
          note,
        });
        emailSent = true;
      } catch (emailError) {
        const message = emailError instanceof Error ? emailError.message : "Unknown email error";
        console.error("[API] Failed to send invitation email:", message);
        warning = "Invitation created but the email could not be sent. Please check your Resend configuration or share the invite link manually via WhatsApp.";
      }
    } else {
      // No email provided (WhatsApp-only invitation) — skip email
      warning = "Invitation created. Share the invite link with the user via WhatsApp.";
    }

    return NextResponse.json(
      {
        invitation,
        acceptUrl,
        message: warning || "Invitation sent successfully.",
        emailSent,
        warning,
      },
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
