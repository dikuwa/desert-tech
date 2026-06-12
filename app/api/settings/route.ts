/**
 * GET /api/settings — Fetch store settings
 * POST /api/settings — Save store settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings, saveStoreSettings } from "@/lib/store-settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const settingsSchema = z.object({
  storeName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranchCode: z.string().optional(),
  receiptPrefix: z.string().optional(),
  lowStockThreshold: z.number().optional(),
  currency: z.string().optional(),
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  heroImageUrl: z.string().optional(),
});

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[Settings API] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid settings data" },
        { status: 400 },
      );
    }

    const saved = await saveStoreSettings(parsed.data);
    return NextResponse.json({ success: true, settings: saved });
  } catch (error) {
    console.error("[Settings API] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
