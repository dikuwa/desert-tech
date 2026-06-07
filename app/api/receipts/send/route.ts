/**
 * API route to send a receipt via email.
 * POST /api/receipts/send
 * Body: { orderNumber, customerEmail, customerName }
 */
import { NextRequest, NextResponse } from "next/server";
import { ReceiptEmail } from "@/components/emails/receipt-email";
import { sendEmail } from "@/lib/email";
import { formatCents } from "@/lib/dashboard-data";
import { useDashboardStore } from "@/lib/store/dashboard";
import { getOrderByNumber } from "@/lib/order-store";
import { render } from "@react-email/components";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  const { error } = await authorizePermission(Permissions.DOCUMENTS_SEND);
  if (error) return error;

  try {
    const body = await request.json();
    const { orderNumber, customerEmail, customerName } = body;

    if (!orderNumber || !customerEmail) {
      return NextResponse.json(
        { error: "orderNumber and customerEmail are required" },
        { status: 400 },
      );
    }

    // Look up order to get total
    const stored = getOrderByNumber(orderNumber);
    const { orders } = useDashboardStore.getState();
    const order = stored
      ? { subtotalCents: stored.subtotalCents }
      : orders.find((o) => o.orderNumber === orderNumber);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const receiptNumber = `RCP-${orderNumber.replace("DT-", "")}`;
    const totalAmount = formatCents(order.subtotalCents);

    // Render the React Email template to HTML
    const html = await render(
      ReceiptEmail({
        customerName: customerName || "Customer",
        orderNumber,
        receiptNumber,
        totalAmount,
      }),
    );

    // Send via Resend
    const result = await sendEmail({
      to: customerEmail,
      subject: `Receipt for ${orderNumber} — Desert Technology`,
      html,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Receipt send error:", error);
    return NextResponse.json(
      { error: "Failed to send receipt" },
      { status: 500 },
    );
  }
}
