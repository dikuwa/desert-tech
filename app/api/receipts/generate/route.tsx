/**
 * API route to generate a PDF receipt for a given order.
 * 
 * POST /api/receipts/generate
 * Body: { orderId }
 * Returns: PDF file as downloadable response
 */
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ReceiptPDF } from "@/components/receipts/receipt-pdf";

// Order data store (same in-memory store used by /api/orders)
// We import this to look up orders
import { getOrderByNumber } from "@/lib/order-store";
import { useDashboardStore } from "@/lib/store/dashboard";
import { addReceipt } from "@/lib/receipt-store";
import { uploadFile } from "@/lib/storage";
import { computePaymentFields } from "@/lib/dashboard-data";

// Helper to get a readable order from either the in-memory store or dashboard store
function findOrder(orderIdOrNumber: string) {
  // Try dashboard store first (has payments data)
  const { orders, payments } = useDashboardStore.getState();
  const order = orders.find((o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
  if (order) {
    const orderPayments = payments.filter((p) => p.orderNumber === order.orderNumber);
    const { totalPaidCents, balanceDueCents } = computePaymentFields(
      order.subtotalCents,
      order.paymentStatus,
      orderPayments,
      { fulfillmentMethod: order.fulfillmentMethod, courierFeeCents: order.courierFeeCents },
    );
    return {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: [
        ...(order.items?.length
          ? order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPriceCents,
              total: item.unitPriceCents * item.quantity,
              sku: item.sku,
            }))
          : [{ name: "Order Items", quantity: order.itemCount, unitPrice: order.subtotalCents / order.itemCount, total: order.subtotalCents }]),
      ],
      subtotalCents: order.subtotalCents,
      paymentStatus: order.paymentStatus,
      totalPaidCents,
      balanceDueCents,
      createdAt: order.createdAt,
      fulfillmentMethod: order.fulfillmentMethod,
      courierFeeCents: order.courierFeeCents,
      shipping: order.shipping,
    };
  }

  // Try in-memory store (orders from the checkout flow)
  const stored = getOrderByNumber(orderIdOrNumber);
  if (stored) {
    return {
      orderNumber: stored.orderNumber,
      customerName: stored.customerName,
      customerPhone: stored.customerPhone,
      items: stored.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.priceCents,
        total: i.priceCents * i.quantity,
      })),
      subtotalCents: stored.subtotalCents,
      paymentStatus: stored.paymentStatus,
      totalPaidCents: 0,
      balanceDueCents: stored.subtotalCents,
      createdAt: stored.createdAt,
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = findOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate receipt number
    const receiptNumber = `RCP-${order.orderNumber.replace("DT-", "")}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const date = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Render PDF to stream with full payment data
    const stream = await renderToStream(
      <ReceiptPDF
        receiptNumber={receiptNumber}
        orderNumber={order.orderNumber}
        date={date}
        customerName={order.customerName}
        customerPhone={order.customerPhone}
        items={order.items}
        subtotal={order.subtotalCents}
        paymentStatus={order.paymentStatus}
        totalPaidCents={order.totalPaidCents}
        balanceDueCents={order.balanceDueCents}
        fulfillmentMethod={order.fulfillmentMethod}
        courierFeeCents={order.courierFeeCents}
        shipping={order.shipping}
      />,
    );

    // Collect stream into buffer using event-based pattern
    // (more compatible across Next.js runtimes than for-await-of)
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });
    const pdfBuffer = Buffer.concat(chunks);

    const isView = body.view === true || body.view === "true" || body.view === 1;

    // Store the receipt record (async upload to R2 if configured)
    let pdfUrl: string | undefined;
    try {
      const uploadResult = await uploadFile(
        pdfBuffer,
        `${receiptNumber}.pdf`,
        "application/pdf",
      );
      pdfUrl = uploadResult.url;
    } catch {}

    addReceipt({
      receiptNumber,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      pdfUrl,
      sentVia: "NotSent",
      issuedAt: new Date().toISOString(),
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isView ? `inline; filename="${receiptNumber}.pdf"` : `attachment; filename="${receiptNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Receipt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/receipts/generate?orderId=xxx — alias for POST for convenience
 * Supports ?view=1 to preview inline in browser instead of downloading.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  const view = request.nextUrl.searchParams.get("view");
  if (!orderId) {
    return NextResponse.json({ error: "orderId query param is required" }, { status: 400 });
  }
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ orderId, view: view === "1" || view === "true" }),
      headers: { "Content-Type": "application/json" },
    }),
  );
}
