/**
 * Server-side store settings helper.
 * Fetches saved store settings from the database.
 * Falls back to defaults from dashboard-data if no DB record exists.
 *
 * Use this in API routes, server components, and PDF generation.
 * For client components, use useDashboardStore(s => s.settings) instead.
 */

import { db } from "@/lib/db";
import { storeSettings as fallbackSettings } from "@/lib/dashboard-data";

export interface StoreSettings {
  storeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranchCode: string;
  receiptPrefix: string;
  lowStockThreshold: number;
  currency: string;
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!db) return fallbackSettings;

  try {
    const record = await db.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!record?.data) return fallbackSettings;

    const parsed = JSON.parse(record.data) as Partial<StoreSettings>;
    return { ...fallbackSettings, ...parsed };
  } catch (error) {
    console.error("[StoreSettings] Failed to fetch:", error);
    return fallbackSettings;
  }
}

/**
 * Save store settings to the database.
 * Upserts the "default" record.
 */
export async function saveStoreSettings(
  data: Partial<StoreSettings>,
): Promise<StoreSettings> {
  if (!db) {
    console.warn("[StoreSettings] No database — settings not saved");
    return { ...fallbackSettings, ...data };
  }

  try {
    // Merge with existing settings
    const existing = await getStoreSettings();
    const merged = { ...existing, ...data };

    await db.storeSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        data: JSON.stringify(merged),
      },
      update: {
        data: JSON.stringify(merged),
      },
    });

    return merged;
  } catch (error) {
    console.error("[StoreSettings] Failed to save:", error);
    return { ...fallbackSettings, ...data };
  }
}
