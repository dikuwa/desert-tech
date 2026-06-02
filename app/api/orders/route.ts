import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const orderSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  preferredContact: z.enum(["WhatsApp", "Phone", "Email"]),
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

    // Generate a unique order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `DT-${timestamp}${random}`;

    const subtotalCents = validated.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );

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
          preferredContact: validated.preferredContact,
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
          preferredContact: validated.preferredContact,
          notes: validated.notes || null,
        },
      });
    }

    // Create the order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: "PendingContact",
        preferredContact: validated.preferredContact,
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

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        fullName: customer.fullName,
        phone: customer.phone,
        preferredContact: customer.preferredContact,
        itemCount: validated.items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: subtotalCents,
        items: validated.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
        createdAt: order.createdAt.toISOString(),
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
