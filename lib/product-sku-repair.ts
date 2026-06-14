import "server-only";

import { db } from "@/lib/db";
import { planProductSkuPrefixRepair } from "@/lib/product-sku";
import { getStoreSettings } from "@/lib/store-settings";

export async function repairLegacyProductSkuPrefixes(): Promise<{
  updatedCount: number;
  conflictCount: number;
}> {
  if (!db) return { updatedCount: 0, conflictCount: 0 };

  try {
    const settings = await getStoreSettings();
    const products = await db.product.findMany({
      select: { id: true, name: true, sku: true },
    });
    const productNames = new Map(products.map((product) => [product.id, product.name]));
    const plan = planProductSkuPrefixRepair(products, settings.receiptPrefix);
    let updatedCount = 0;

    for (const conflict of plan.conflicts) {
      const names = conflict.conflictingProductIds
        .map((id) => `${productNames.get(id) ?? "Unknown product"} (${id})`)
        .join(", ");
      console.warn(`[SKU repair] SKIP ${conflict.currentSku} -> ${conflict.nextSku}; conflicts with ${names}`);
    }

    for (const update of plan.updates) {
      const result = await db.product.updateMany({
        where: { id: update.id, sku: update.currentSku },
        data: { sku: update.nextSku },
      });
      if (result.count === 1) {
        updatedCount += 1;
        console.log(`[SKU repair] UPDATED ${update.currentSku} -> ${update.nextSku} (${productNames.get(update.id)})`);
      }
    }

    return { updatedCount, conflictCount: plan.conflicts.length };
  } catch (error) {
    console.error("[SKU repair] Automatic repair failed:", error);
    return { updatedCount: 0, conflictCount: 0 };
  }
}
