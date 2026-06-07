const CATEGORY_SKU_CODES: Record<string, string> = {
  Apple: "APP",
  Windows: "LAP",
  Gaming: "GAME",
  "CCTV & Security": "CCTV",
  "POS Systems": "POS",
  Accessories: "ACC",
  "Phones & Tablets": "PHT",
  Networking: "NET",
  "Auto Services": "AUTO",
};

export function generateProductSku(
  category: string,
  existingProducts: { sku?: string | null }[],
): string {
  const code = CATEGORY_SKU_CODES[category] || "GEN";
  const skuPattern = new RegExp(`^DT-${code}-(\\d+)$`, "i");
  let maxSequence = 0;

  for (const product of existingProducts) {
    const match = product.sku?.match(skuPattern);
    if (!match) continue;

    const sequence = Number.parseInt(match[1], 10);
    if (sequence > maxSequence) maxSequence = sequence;
  }

  return `DT-${code}-${String(maxSequence + 1).padStart(4, "0")}`;
}
