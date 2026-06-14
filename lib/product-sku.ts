const CATEGORY_SKU_CODES: Record<string, string> = {
  // Apple/Mac products
  Apple: "APP",
  Mac: "APP",
  MacBooks: "APP",
  // Windows laptops
  Windows: "LAP",
  Laptops: "LAP",
  // Desktops
  Desktops: "DESK",
  // Gaming
  Gaming: "GAME",
  "Gaming PCs": "GAME",
  "Gaming PC": "GAME",
  // Security
  "CCTV & Security": "CCTV",
  "CCTV Security": "CCTV",
  CCTV: "CCTV",
  Security: "CCTV",
  // Business systems
  "POS Systems": "POS",
  POS: "POS",
  // Accessories
  Accessories: "ACC",
  // Mobile devices
  "Phones & Tablets": "PHT",
  Phones: "PHT",
  Tablets: "PHT",
  // Networking
  Networking: "NET",
  Network: "NET",
  // Displays
  "TVs & Displays": "TV",
  TVs: "TV",
  Displays: "TV",
  Monitors: "TV",
  // Audio
  Audio: "AUD",
  // Components
  Components: "COMP",
  // Printers
  Printers: "PRT",
  // Services
  Services: "SVC",
  "Auto Services": "AUTO",
  // General/Uncategorized - always fallback to GEN
  General: "GEN",
  Other: "GEN",
  Uncategorized: "GEN",
};

export function normalizeSkuPrefix(prefix: string, fallback = "DT"): string {
  return prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || fallback;
}

export function generateProductSku(
  category: string,
  existingProducts: { sku?: string | null }[],
  prefix = "DT",
): string {
  const code = CATEGORY_SKU_CODES[category] || "GEN";
  const normalizedPrefix = normalizeSkuPrefix(prefix);
  const skuPattern = new RegExp(`^${normalizedPrefix}-${code}-(\\d+)$`, "i");
  let maxSequence = 0;

  for (const product of existingProducts) {
    const match = product.sku?.match(skuPattern);
    if (!match) continue;

    const sequence = Number.parseInt(match[1], 10);
    if (sequence > maxSequence) maxSequence = sequence;
  }

  return `${normalizedPrefix}-${code}-${String(maxSequence + 1).padStart(4, "0")}`;
}

interface ProductSkuRecord {
  id: string;
  sku?: string | null;
}

export interface ProductSkuPrefixUpdate {
  id: string;
  currentSku: string;
  nextSku: string;
}

export interface ProductSkuPrefixConflict extends ProductSkuPrefixUpdate {
  conflictingProductIds: string[];
}

export function planProductSkuPrefixRepair(
  products: ProductSkuRecord[],
  currentPrefix: string,
  legacyPrefix = "DT",
): {
  updates: ProductSkuPrefixUpdate[];
  conflicts: ProductSkuPrefixConflict[];
} {
  const normalizedCurrentPrefix = normalizeSkuPrefix(currentPrefix);
  const normalizedLegacyPrefix = normalizeSkuPrefix(legacyPrefix);
  if (normalizedCurrentPrefix === normalizedLegacyPrefix) {
    return { updates: [], conflicts: [] };
  }
  const legacyStart = `${normalizedLegacyPrefix}-`;
  const productIdsBySku = new Map<string, string[]>();

  for (const product of products) {
    if (!product.sku) continue;
    const key = product.sku.toLowerCase();
    productIdsBySku.set(key, [...(productIdsBySku.get(key) ?? []), product.id]);
  }

  const candidates = products.flatMap((product): ProductSkuPrefixUpdate[] => {
    const sku = product.sku?.trim();
    if (!sku || !sku.toUpperCase().startsWith(legacyStart)) return [];

    return [{
      id: product.id,
      currentSku: sku,
      nextSku: `${normalizedCurrentPrefix}-${sku.slice(legacyStart.length)}`,
    }];
  });
  const candidateIdsBySku = new Map<string, string[]>();

  for (const candidate of candidates) {
    const key = candidate.nextSku.toLowerCase();
    candidateIdsBySku.set(key, [...(candidateIdsBySku.get(key) ?? []), candidate.id]);
  }

  const updates: ProductSkuPrefixUpdate[] = [];
  const conflicts: ProductSkuPrefixConflict[] = [];

  for (const candidate of candidates) {
    const key = candidate.nextSku.toLowerCase();
    const conflictingProductIds = Array.from(new Set([
      ...(productIdsBySku.get(key) ?? []),
      ...(candidateIdsBySku.get(key) ?? []),
    ])).filter((id) => id !== candidate.id);

    if (conflictingProductIds.length > 0) {
      conflicts.push({ ...candidate, conflictingProductIds });
    } else {
      updates.push(candidate);
    }
  }

  return { updates, conflicts };
}

export function resolveLowStockThreshold(productThreshold: number | undefined, storeThreshold: number): number {
  return productThreshold && productThreshold > 0 ? productThreshold : Math.max(0, storeThreshold);
}

export function getProductAvailability(stockQuantity: number, threshold: number): "OutOfStock" | "LowStock" | "InStock" {
  if (stockQuantity <= 0) return "OutOfStock";
  return stockQuantity <= threshold ? "LowStock" : "InStock";
}
