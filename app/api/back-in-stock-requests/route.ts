import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";

const requestSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  customerName: z.string().min(1).max(100),
  preferredContact: z.array(z.enum(["WhatsApp", "Phone", "Email"])).min(1).max(3),
  contactValues: z.record(z.enum(["WhatsApp", "Phone", "Email"]), z.string().min(1).max(200)),
  urgency: z.enum(["ASAP", "Flexible", "JustChecking"]),
  note: z.string().max(500).optional(),
});

const statusSchema = z.union([
  z.object({
    id: z.string().min(1),
    status: z.enum(["New", "ReadyToContact", "Contacted", "Cancelled"]),
  }),
  z.object({
    productId: z.string().min(1),
    productName: z.string().min(1),
    status: z.literal("ReadyToContact"),
  }),
]);

const deleteSchema = z.object({ id: z.string().min(1) });

export async function GET() {
  const { error } = await authorizePermission(Permissions.STOCK_REQUESTS_VIEW);
  if (error) return error;

  const { getBackInStockRequests } = await import("@/lib/back-in-stock-store");
  const fallbackRequests = getBackInStockRequests();

  try {
    const { db } = await import("@/lib/db");
    if (db) {
      const databaseRequests = await db.backInStockRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      const byId = new Map(fallbackRequests.map((request) => [request.id, request]));
      for (const request of databaseRequests) {
        byId.set(request.id, {
          ...request,
          preferredContact: request.preferredContact.split(",") as ("WhatsApp" | "Phone" | "Email")[],
          urgency: request.urgency as "ASAP" | "Flexible" | "JustChecking",
          status: request.status as "New" | "ReadyToContact" | "Contacted" | "Cancelled",
          contactValues: (() => {
            try {
              return JSON.parse(request.contactValue);
            } catch {
              return { [request.preferredContact]: request.contactValue };
            }
          })(),
          note: request.note ?? undefined,
          createdAt: request.createdAt.toISOString(),
          updatedAt: request.updatedAt.toISOString(),
        });
      }
      return NextResponse.json({ success: true, requests: Array.from(byId.values()) });
    }
  } catch (error) {
    console.warn("[back-in-stock] Could not load database requests:", error);
  }

  return NextResponse.json({ success: true, requests: fallbackRequests });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Validate product exists and is sold out
    const { products } = await import("@/lib/data");
    const product = products.find((p) => p.id === validated.productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (product.availability !== "sold_out") {
      // Also check dashboard products for admin-added products
      const { useDashboardStore } = await import("@/lib/store/dashboard");
      const store = useDashboardStore.getState();
      const dashProduct = store.products.find((p) => p.id === validated.productId);
      if (!dashProduct || dashProduct.availability !== "OutOfStock") {
        return NextResponse.json(
          { success: false, error: "This product is currently available for purchase" },
          { status: 400 },
        );
      }
    }

    // Try database first. The in-memory fallback is also kept so local/demo
    // dashboards can retrieve the request from this API.
    try {
      const { db } = await import("@/lib/db");
      if (db) {
        // Check for existing open request for same product + contact
        const existing = await db.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM "BackInStockRequest"
           WHERE "productId" = $1 AND "contactValue" = $2 AND "status" IN ('New', 'ReadyToContact')
           LIMIT 1`,
          validated.productId,
          JSON.stringify(validated.contactValues),
        );

        if (existing.length > 0) {
          return NextResponse.json({
            success: true,
            duplicate: true,
            message: "You've already requested this item.",
          });
        }

        await db.$executeRawUnsafe(
          `INSERT INTO "BackInStockRequest" ("id", "productId", "productName", "customerName", "preferredContact", "contactValue", "urgency", "note", "status", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'New', NOW(), NOW())`,
          crypto.randomUUID(),
          validated.productId,
          validated.productName,
          validated.customerName,
          validated.preferredContact.join(","),
          JSON.stringify(validated.contactValues),
          validated.urgency,
          validated.note || null,
        );
      }
    } catch {
      // Database unavailable — fall through to in-memory store
      console.log("Database unavailable, storing back-in-stock request in-memory");
    }

    // Always store in in-memory store for dashboard visibility
    const { addBackInStockRequest, findDuplicateRequest } = await import(
      "@/lib/back-in-stock-store"
    );

    const serializedContactValues = JSON.stringify(validated.contactValues);
    const duplicate = findDuplicateRequest(validated.productId, serializedContactValues);
    if (duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "You've already requested this item.",
      });
    }

    addBackInStockRequest({
      productId: validated.productId,
      productName: validated.productName,
      customerName: validated.customerName,
      preferredContact: validated.preferredContact,
      contactValue: serializedContactValues,
      contactValues: validated.contactValues,
      urgency: validated.urgency,
      note: validated.note,
    });

    // Also add to Zustand dashboard store for immediate visibility
    try {
      const { useDashboardStore } = await import("@/lib/store/dashboard");
      useDashboardStore.getState().addBackInStockRequest({
        productId: validated.productId,
        productName: validated.productName,
        customerName: validated.customerName,
        preferredContact: validated.preferredContact,
        contactValue: serializedContactValues,
        contactValues: validated.contactValues,
        urgency: validated.urgency,
        note: validated.note,
      });
    } catch {
      // Zustand store not available (server-side)
    }

    return NextResponse.json({
      success: true,
      message: "We'll notify you when this item is available.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Back-in-stock request error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong. Please try again or contact us directly.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const { error: authorizationError } = await authorizePermission(Permissions.STOCK_REQUESTS_MANAGE);
  if (authorizationError) return authorizationError;

  try {
    const action = statusSchema.parse(await req.json());
    const status = action.status;
    let updated = false;

    try {
      const { db } = await import("@/lib/db");
      if (db) {
        if ("id" in action) {
          await db.backInStockRequest.update({ where: { id: action.id }, data: { status } });
          updated = true;
        } else {
          const result = await db.backInStockRequest.updateMany({
            where: { productId: action.productId, status: "New" },
            data: { status },
          });
          updated = result.count > 0;
        }
      }
    } catch {
      // The request may belong to the local/demo fallback.
    }

    if ("id" in action) {
      const { updateBackInStockRequestStatus } = await import("@/lib/back-in-stock-store");
      updated = Boolean(updateBackInStockRequestStatus(action.id, status)) || updated;
    } else {
      const { markRequestsReadyForProduct } = await import("@/lib/back-in-stock-store");
      updated = markRequestsReadyForProduct(action.productId, action.productName).length > 0 || updated;
    }

    return updated
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Could not update request" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error: authorizationError } = await authorizePermission(Permissions.STOCK_REQUESTS_MANAGE);
  if (authorizationError) return authorizationError;

  try {
    const { id } = deleteSchema.parse(await req.json());
    let deleted = false;

    try {
      const { db } = await import("@/lib/db");
      if (db) {
        await db.backInStockRequest.delete({ where: { id } });
        deleted = true;
      }
    } catch {
      // The request may belong to the local/demo fallback.
    }

    const { deleteBackInStockRequest } = await import("@/lib/back-in-stock-store");
    deleted = deleteBackInStockRequest(id) || deleted;

    return deleted
      ? NextResponse.json({ success: true })
      : NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Could not delete request" }, { status: 500 });
  }
}
