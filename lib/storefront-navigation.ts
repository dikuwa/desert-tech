import type { DashboardBrand, DashboardCategory } from "@/lib/dashboard-data";

export type StorefrontCategoryGroup = "computers" | "mobile" | "business" | "other";

const GROUP_KEYWORDS: Record<Exclude<StorefrontCategoryGroup, "other">, string[]> = {
  computers: ["apple", "windows", "gaming", "laptop", "desktop", "printer", "component", "computer"],
  mobile: ["phone", "tablet", "tv", "display", "audio", "accessory", "accessories", "mobile"],
  business: ["cctv", "security", "network", "pos", "business"],
};

export function buildShopUrl(filter?: "category" | "brand", value?: string) {
  if (!filter || !value) return "/shop";
  return `/shop?${filter}=${encodeURIComponent(value)}`;
}

export function getActiveBrands(brands: DashboardBrand[]) {
  return brands
    .filter((brand) => brand.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function getActiveCategories(categories: DashboardCategory[]) {
  const seen = new Set<string>();

  return categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .filter((category) => {
      const visibleName = category.name.trim().toLowerCase();
      if (seen.has(visibleName)) return false;
      seen.add(visibleName);
      return true;
    });
}

export function groupActiveCategories(categories: DashboardCategory[]) {
  const grouped: Record<StorefrontCategoryGroup, DashboardCategory[]> = {
    computers: [],
    mobile: [],
    business: [],
    other: [],
  };

  getActiveCategories(categories).forEach((category) => {
      const searchable = `${category.slug} ${category.name}`.toLowerCase();
      const group =
        (Object.entries(GROUP_KEYWORDS).find(([, keywords]) =>
          keywords.some((keyword) => searchable.includes(keyword)),
        )?.[0] as Exclude<StorefrontCategoryGroup, "other"> | undefined) ?? "other";

      grouped[group].push(category);
    });

  return grouped;
}
