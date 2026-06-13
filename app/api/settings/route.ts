/**
 * GET /api/settings — Fetch store settings
 * POST /api/settings — Save store settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings, saveStoreSettings } from "@/lib/store-settings";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
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
  receiptPrefix: z.string().trim().min(1).max(12).regex(/^[a-z0-9]+$/i).optional(),
  lowStockThreshold: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  heroImageUrl: z.string().optional(),
});

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(
      { success: true, settings },
      { headers: { "Cache-Control": "no-store" } },
    );
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
    const auth = await authorizePermission(Permissions.SETTINGS_UPDATE);
    if (auth.error) return auth.error;

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
