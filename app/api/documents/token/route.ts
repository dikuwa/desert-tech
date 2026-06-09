/**
 * API endpoint for document tokens.
 *
 * POST /api/documents/token — Generate a signed token for a receipt, quotation, or invoice
 *   Body: {
 *     type: "receipt" | "quotation" | "invoice",
 *     referenceId: string,
 *     documentNumber: string,
 *     data?: object  // Data snapshot for deployment-persistent tokens
 *   }
 *   Returns: { success, token, url, shortUrl }
 *
 * GET /api/documents/token?token=xxx — Verify and decode a signed token
 *   Returns: { success, type, documentNumber, referenceId, data, iat, exp }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateDocumentToken,
  verifyDocumentToken,
} from "@/lib/document-tokens";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  const { error } = await authorizePermission(Permissions.DOCUMENTS_SEND);
  if (error) return error;

  try {
    const body = await request.json();
    const { type, referenceId, documentNumber, data } = body;

    if (!type || !referenceId) {
      return NextResponse.json(
        { error: "type and referenceId are required" },
        { status: 400 },
      );
    }

    if (type !== "receipt" && type !== "quotation" && type !== "invoice") {
      return NextResponse.json(
        { error: "type must be 'receipt', 'quotation', or 'invoice'" },
        { status: 400 },
      );
    }

    const token = generateDocumentToken(
      type,
      referenceId,
      documentNumber || referenceId,
      data || undefined,
    );

    const { getDocumentShareUrl } = await import("@/lib/app-url");
    const url = getDocumentShareUrl(token);

    // Create a short branded link (/d/[shortCode]) as well
    let shortUrl: string | null = null;
    try {
      const { createShortLink } = await import("@/lib/document-share");
      const result = await createShortLink(
        type,
        referenceId,
        documentNumber,
        data || undefined,
      );
      shortUrl = result.url;
    } catch (linkError) {
      console.warn("[Token] Short link creation failed (non-fatal):", linkError);
    }

    return NextResponse.json({
      success: true,
      token,
      url,
      shortUrl,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "token query param is required" },
        { status: 400 },
      );
    }

    const payload = verifyDocumentToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Document not found or link has expired" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      type: payload.type,
      documentNumber: payload.documentNumber,
      referenceId: payload.referenceId,
      data: payload.data || null,
      iat: payload.iat,
      exp: payload.exp,
    });
  } catch (error) {
    console.error("Token lookup error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 },
    );
  }
}
