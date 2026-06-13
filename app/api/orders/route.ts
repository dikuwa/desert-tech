import { NextResponse } from "next/server";
import { z } from "zod";
import { addOrder, getOrders } from "@/lib/order-store";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import { getStoreSettings } from "@/lib/store-settings";

const orderSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  preferredContact: z.union([
    z.enum(["WhatsApp", "Phone", "Email"]).transform((method) => [method]),
    z.array(z.enum(["WhatsApp", "Phone", "Email"])).min(1).max(3),
  ]),
  notes: z.string().max(500).optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      slug: z.string(),
      priceCents: z.number().int().positive(),
      quantity: z.number().int().positive(),
      specs: z.string(),
    }),
  ).min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = orderSchema.parse(body);
    const preferredContact = validated.preferredContact.join(",");

    // Generate a unique order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const settings = await getStoreSettings();
    const orderNumber = `${settings.receiptPrefix}-${timestamp}${random}`;

    const subtotalCents = validated.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );

    let dbCustomer = null;
    let dbOrder = null;

    // Try database first
    try {
      const { db } = await import("@/lib/db");

      if (!db) throw new Error("Database not available");

      // Find or create customer by phone
      let customer = await db.customer.findFirst({
        where: { phone: validated.phone },
      });

      if (customer) {
        customer = await db.customer.update({
          where: { id: customer.id },
          data: {
            fullName: validated.fullName,
            whatsapp: validated.whatsapp || validated.phone,
            email: validated.email || null,
            preferredContact,
            notes: validated.notes || null,
          },
        });
      } else {
        customer = await db.customer.create({
          data: {
            fullName: validated.fullName,
            phone: validated.phone,
            whatsapp: validated.whatsapp || validated.phone,
            email: validated.email || null,
            preferredContact,
            notes: validated.notes || null,
          },
        });
      }

      // Create the order with items
      const order = await db.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          contactStatus: "NotContacted",
          paymentStatus: "Unpaid",
          fulfillmentStatus: "Pending",
          preferredContact,
          subtotalCents,
          notes: validated.notes || null,
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              productName: item.name,
              quantity: item.quantity,
              unitPriceCents: item.priceCents,
              totalCents: item.priceCents * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      dbCustomer = customer;
      dbOrder = order;
    } catch {
      // Database unavailable — fall through to in-memory store
      console.log("Database unavailable, storing order in-memory");
    }

    // Always store in in-memory store for dashboard visibility
    addOrder({
      id: orderNumber,
      orderNumber,
      customerName: validated.fullName,
      customerPhone: validated.phone,
      itemCount: validated.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCents,
      contactStatus: "NotContacted",
      paymentStatus: "Unpaid",
      fulfillmentStatus: "Pending",
      preferredContact,
      notes: validated.notes || undefined,
      items: validated.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
      createdAt: new Date().toISOString(),
    });

    // Create a dashboard notification so the poller picks it up
    const { createSystemNotification } = await import("@/lib/notifications");
    await createSystemNotification({
      type: "order",
      title: "New Storefront Order",
      message: `${validated.fullName} placed an order (${orderNumber})`,
      relatedEntityType: "order",
      relatedEntityId: orderNumber,
    });

    return NextResponse.json({
      success: true,
      order: {
        orderNumber,
        fullName: validated.fullName,
        phone: validated.phone,
        preferredContact,
        itemCount: validated.items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: subtotalCents,
        items: validated.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again or contact us directly." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const { error } = await authorizePermission(Permissions.ORDERS_VIEW);
  if (error) return error;

  const storedOrders = getOrders();
  return NextResponse.json({ orders: storedOrders });
}
