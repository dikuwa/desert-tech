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
