import { db } from "@/lib/db";
import { planProductSkuPrefixRepair } from "@/lib/product-sku";
import { getStoreSettings } from "@/lib/store-settings";

const applyChanges = process.argv.includes("--apply");

async function main() {
  if (!db) throw new Error("DATABASE_URL is required to repair product SKUs.");

  const settings = await getStoreSettings();
  const products = await db.product.findMany({
    select: { id: true, name: true, sku: true },
    orderBy: { createdAt: "asc" },
  });
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const plan = planProductSkuPrefixRepair(products, settings.receiptPrefix);

  console.log(`[SKU repair] Current Store Settings prefix: ${settings.receiptPrefix}`);
  console.log(`[SKU repair] ${plan.updates.length} safe update(s), ${plan.conflicts.length} conflict(s).`);

  for (const conflict of plan.conflicts) {
    const names = conflict.conflictingProductIds
      .map((id) => `${productNames.get(id) ?? "Unknown product"} (${id})`)
      .join(", ");
    console.warn(`[SKU repair] SKIP ${conflict.currentSku} -> ${conflict.nextSku}; conflicts with ${names}`);
  }

  if (!applyChanges) {
    for (const update of plan.updates) {
      console.log(`[SKU repair] DRY RUN ${update.currentSku} -> ${update.nextSku} (${productNames.get(update.id)})`);
    }
    console.log("[SKU repair] No changes made. Run with --apply to update safe items.");
    return;
  }

  let updatedCount = 0;
  for (const update of plan.updates) {
    const result = await db.product.updateMany({
      where: { id: update.id, sku: update.currentSku },
      data: { sku: update.nextSku },
    });
    if (result.count === 1) {
      updatedCount += 1;
      console.log(`[SKU repair] UPDATED ${update.currentSku} -> ${update.nextSku} (${productNames.get(update.id)})`);
    } else {
      console.warn(`[SKU repair] SKIP ${update.currentSku}; product changed after the repair plan was created.`);
    }
  }

  console.log(`[SKU repair] Complete. Updated ${updatedCount} product SKU(s).`);
}

main()
  .catch((error) => {
    console.error("[SKU repair] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db?.$disconnect();
  });
