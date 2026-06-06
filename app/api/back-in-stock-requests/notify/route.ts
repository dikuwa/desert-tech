import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { BackInStockNotification } from "@/components/emails/back-in-stock-notification";
import { render } from "@react-email/components";

const notifySchema = z.object({
  productId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId } = notifySchema.parse(body);

    // Get product info - check lib/data first, then fall back to Zustand store
    const { products } = await import("@/lib/data");
    let dashProduct = products.find((p) => p.id === productId) || null;
    let productName: string;
    let productUrl: string;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (dashProduct) {
      productName = dashProduct.name;
      productUrl = `${baseUrl}/products/${dashProduct.slug}`;
    } else {
      // Check Zustand store for admin-added products
      try {
        const { useDashboardStore } = await import("@/lib/store/dashboard");
        const store = useDashboardStore.getState();
        const dashStoreProduct = store.products.find((p) => p.id === productId);
        if (dashStoreProduct) {
          productName = dashStoreProduct.name;
          productUrl = `${baseUrl}/products/${dashStoreProduct.slug}`;
        } else {
          return NextResponse.json(
            { success: false, error: "Product not found" },
            { status: 404 },
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 },
        );
      }
    }

    // Get all open requests for this product
    const { getRequestsByProductId, updateBackInStockRequestStatus } =
      await import("@/lib/back-in-stock-store");

    const openRequests = getRequestsByProductId(productId);

    if (openRequests.length === 0) {
      return NextResponse.json({
        success: true,
        notified: 0,
        message: "No open requests for this product.",
      });
    }

    // Separate email contacts from WhatsApp/Phone
    const emailRequests = openRequests.filter(
      (r) => r.preferredContact === "Email",
    );
    const otherRequests = openRequests.filter(
      (r) => r.preferredContact !== "Email",
    );

    // Send emails to email contacts
    const emailResults: Array<{ customerName: string; success: boolean; error?: string }> = [];

    for (const request of emailRequests) {
      try {
        const emailHtml = await render(
          BackInStockNotification({
            customerName: request.customerName,
            productName,
            productUrl,
          }),
        );

        const result = await sendEmail({
          to: request.contactValue,
          subject: `Back in Stock: ${productName} is now available!`,
          html: emailHtml,
        });

        if (result.success) {
          updateBackInStockRequestStatus(request.id, "Contacted");
        }

        emailResults.push({
          customerName: request.customerName,
          success: result.success,
          error: result.error ? String(result.error) : undefined,
        });
      } catch (error) {
        emailResults.push({
          customerName: request.customerName,
          success: false,
          error: String(error),
        });
      }
    }

    // Mark WhatsApp/Phone requests as ReadyToContact (they were already marked)
    // These stay in ReadyToContact status for manual outreach

    // Also update Zustand store for dashboard visibility
    try {
      const { useDashboardStore } = await import("@/lib/store/dashboard");
      const store = useDashboardStore.getState();

      // Mark emailed requests as contacted
      for (const request of emailRequests) {
        store.updateBackInStockStatus(request.id, "Contacted");
      }
    } catch {
      // Zustand not available server-side
    }

    const totalNotified = emailResults.filter((r) => r.success).length;
    const totalFailed = emailResults.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      notified: totalNotified,
      failed: totalFailed,
      emailResults,
      otherContactsCount: otherRequests.length,
      message:
        totalNotified > 0
          ? `Sent ${totalNotified} notification${totalNotified > 1 ? "s" : ""}. ${totalFailed > 0 ? `${totalFailed} failed. ` : ""}${otherRequests.length > 0 ? `${otherRequests.length} WhatsApp/Phone contact${otherRequests.length > 1 ? "s" : ""} need manual outreach.` : ""}`
          : totalFailed > 0
            ? "Email sending failed. Check your email configuration."
            : otherRequests.length > 0
              ? `${otherRequests.length} customer${otherRequests.length > 1 ? "s" : ""} with WhatsApp/Phone need manual contact.`
              : "No customers to notify.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Back-in-stock notify error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong sending notifications.",
      },
      { status: 500 },
    );
  }
}
