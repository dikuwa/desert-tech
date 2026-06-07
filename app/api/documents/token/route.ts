/**
 * API endpoint for document tokens.
 *
 * POST /api/documents/token — Generate a new token for a receipt or quotation
 *   Body: { type: "receipt" | "quotation", referenceId: string, documentNumber: string }
 *   Returns: { token, url }
 *
 * GET /api/documents/token?token=xxx — Retrieve document data by token
 *   Returns: { type, documentNumber, referenceId, order?: {...}, quotation?: {...} }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateDocumentToken,
  getDocumentByToken,
  getPublicDocumentUrl,
} from "@/lib/document-tokens";
import { useDashboardStore } from "@/lib/store/dashboard";
import { getOrderByNumber } from "@/lib/order-store";
import { computePaymentFields } from "@/lib/dashboard-data";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  const { error } = await authorizePermission(Permissions.DOCUMENTS_SEND);
  if (error) return error;

  try {
    const body = await request.json();
    const { type, referenceId, documentNumber } = body;

    if (!type || !referenceId) {
      return NextResponse.json(
        { error: "type and referenceId are required" },
        { status: 400 },
      );
    }

    if (type !== "receipt" && type !== "quotation") {
      return NextResponse.json(
        { error: "type must be 'receipt' or 'quotation'" },
        { status: 400 },
      );
    }

    const token = generateDocumentToken(
      type,
      referenceId,
      documentNumber || referenceId,
    );
    const url = getPublicDocumentUrl(token, type);

    return NextResponse.json({ success: true, token, url });
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

    const entry = getDocumentByToken(token);
    if (!entry) {
      return NextResponse.json(
        { error: "Document not found or link has expired" },
        { status: 404 },
      );
    }

    const { orders, quotations, payments } = useDashboardStore.getState();
    const stored = getOrderByNumber(entry.referenceId);

    if (entry.type === "receipt") {
      // Look up order in dashboard store first (has payment data)
      const order = orders.find((o) => o.id === entry.referenceId || o.orderNumber === entry.referenceId)
        || (stored ? {
            orderNumber: stored.orderNumber,
            customerName: stored.customerName,
            customerPhone: stored.customerPhone,
            itemCount: stored.itemCount,
            subtotalCents: stored.subtotalCents,
            paymentStatus: stored.paymentStatus || "Unpaid",
            fulfillmentStatus: "Pending",
            createdAt: stored.createdAt,
            items: stored.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPriceCents: i.priceCents,
            })),
          } : null);

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 },
        );
      }

      // Calculate payment totals from dashboard store payments (respects paymentStatus for PaidInFull)
      const orderPayments = payments.filter((p) => p.orderNumber === (order as any).orderNumber);
      const { totalPaidCents, balanceDueCents } = computePaymentFields(
        order.subtotalCents,
        order.paymentStatus,
        orderPayments,
        { fulfillmentMethod: (order as any).fulfillmentMethod, courierFeeCents: (order as any).courierFeeCents },
      );

      return NextResponse.json({
        success: true,
        type: "receipt",
        documentNumber: entry.documentNumber,
        data: {
          orderNumber: (order as any).orderNumber || order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          items: order.items || [],
          subtotalCents: order.subtotalCents,
          paymentStatus: order.paymentStatus,
          totalPaidCents,
          balanceDueCents,
          fulfillmentStatus: (order as any).fulfillmentStatus || "Pending",
          createdAt: order.createdAt,
          fulfillmentMethod: (order as any).fulfillmentMethod,
          courierFeeCents: (order as any).courierFeeCents,
          shipping: (order as any).shipping,
        },
      });
    }

    if (entry.type === "quotation") {
      const quotation = quotations.find(
        (q) => q.id === entry.referenceId || q.quotationNumber === entry.referenceId,
      );

      if (!quotation) {
        return NextResponse.json(
          { error: "Quotation not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        type: "quotation",
        documentNumber: entry.documentNumber,
        data: {
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName,
          customerPhone: quotation.customerPhone,
          items: quotation.items,
          subtotalCents: quotation.subtotalCents,
          notes: quotation.notes,
          status: quotation.status,
          createdAt: quotation.createdAt,
        },
      });
    }

    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  } catch (error) {
    console.error("Token lookup error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 },
    );
  }
}
