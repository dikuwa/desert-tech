"use client";

import type { DashboardCategory, DashboardProduct } from "@/lib/dashboard-data";

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  condition: "New" | "Refurbished" | "Pre-Owned";
  description: string;
  specs: string;
  priceCents: number;
  oldPriceCents?: number;
  discountPercent?: number;
  imageUrl: string;
  images: string[];
  availability: "in_stock" | "low_stock" | "sold_out";
  stockCount?: number;
  warranty?: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  sku?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  imageUrl?: string;
}

export interface PromotionData {
  id: string;
  title: string;
  slug: string;
  description: string;
  discountLabel?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  placement: string;
  type: "product" | "bundle" | "service" | "general";
  linkedProductId?: string;
  linkedCategory?: string;
  serviceSlug?: string;
  ctaLabel?: string;
}

// Static data arrays - now empty, only using dashboard data
export const categories: CategoryData[] = [];
export const products: ProductData[] = [];
export const promotions: PromotionData[] = [];

export function getProductBySlug(slug: string): ProductData | undefined {
  return undefined;
}

export function getProductsByCategory(categorySlug: string): ProductData[] {
  return [];
}

export function getFeaturedProducts(): ProductData[] {
  return [];
}

export function getFeaturedPromotions(): PromotionData[] {
  return [];
}

export function getAllActivePromotions(): PromotionData[] {
  return [];
}

export function getPromotionBySlug(slug: string): PromotionData | undefined {
  return undefined;
}

export function getPromotionProducts(promotion: PromotionData): ProductData[] {
  return [];
}

export function getCategoryBySlug(slug: string): CategoryData | undefined {
  return undefined;
}

import { useDashboardStore } from "@/lib/store/dashboard";

export function useSearchProducts(query: string): ProductData[] {
  const products = useDashboardStore((s) => s.products);
  const categories = useDashboardStore((s) => s.categories);
  
  if (!query.trim()) return [];
  
  const q = query.toLowerCase();
  const mappedProducts = mergeProducts(products, categories);
  
  return mappedProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.specs.toLowerCase().includes(q),
  );
}

// Keep for compatibility - returns empty array, use useSearchProducts hook instead
export function searchProducts(query: string): ProductData[] {
  return [];
}

export function filterProducts(
  params: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
    condition?: string;
    search?: string;
    sort?: string;
  },
  productsArray?: ProductData[],
): ProductData[] {
  let result = [...(productsArray ?? [])];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q),
    );
  }
  if (params.category && params.category !== "all") {
    result = result.filter((p) => p.categorySlug === params.category);
  }
  if (params.brand && params.brand !== "all") {
    result = result.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
  }
  if (params.minPrice !== undefined) {
    result = result.filter((p) => p.priceCents >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    result = result.filter((p) => p.priceCents <= params.maxPrice!);
  }
  if (params.availability && params.availability !== "all") {
    result = result.filter((p) => p.availability === params.availability);
  }
  if (params.condition) {
    result = result.filter((p) => p.condition === params.condition);
  }

  if (params.sort) {
    switch (params.sort) {
      case "price-asc":
        result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        break;
      default:
        break;
    }
  }

  return result;
}

/**
 * Convert dashboard availability to storefront availability format.
 */
function mapAvailability(avail: string): "in_stock" | "low_stock" | "sold_out" {
  if (avail === "InStock") return "in_stock";
  if (avail === "LowStock") return "low_stock";
  return "sold_out";
}

/**
 * Map a DashboardProduct to the storefront ProductData interface.
 * Uses real category data from dashboard.
 */
export function dashboardProductToProductData(
  p: DashboardProduct,
  categories: DashboardCategory[] = []
): ProductData {
  // Look up the actual category from provided categories
  const category = categories.find(c => c.name === p.category);
  const hasCategory = p.category && p.category.trim() !== "";
  const categorySlug = category?.slug || "general";
  const categoryId = category?.id || "cat-general";
  const categoryName = hasCategory ? p.category : "General";
  const stockCount = p.stockQuantity > 0 ? p.stockQuantity : undefined;
  
  const images = p.images && p.images.length > 0
    ? p.images
    : p.imageUrl
      ? [p.imageUrl]
      : [];
  const imageUrl = p.imageUrl || images[0] || "";

  // Use General for unknown/empty brands
  const hasBrand = p.brand && p.brand.trim() !== "" && p.brand !== "Unknown";
  const brandName = hasBrand ? p.brand : "General";

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: brandName,
    categoryId,
    categoryName,
    categorySlug,
    condition: (p.condition === "New" || p.condition === "Refurbished" || p.condition === "Pre-Owned") ? p.condition : "New",
    description: p.description || "",
    specs: p.description?.split(".")[0] || p.name,
    priceCents: p.priceCents,
    oldPriceCents: p.compareAtPriceCents || undefined,
    discountPercent: p.compareAtPriceCents ? Math.round((1 - p.priceCents / p.compareAtPriceCents) * 100) : undefined,
    imageUrl,
    images: images.length > 0 ? images : imageUrl ? [imageUrl] : [],
    availability: mapAvailability(p.availability),
    stockCount,
    warranty: p.warranty || undefined,
    rating: 4.0,
    reviewCount: 0,
    isFeatured: p.isFeatured,
    sku: p.sku || undefined,
  };
}

/**
 * Convert dashboard products to storefront ProductData format.
 * Only uses dashboard data - no static products.
 */
export function mergeProducts(
  dashboardProducts: DashboardProduct[],
  categories: DashboardCategory[] = []
): ProductData[] {
  return dashboardProducts.map(p => dashboardProductToProductData(p, categories));
}

export function dashboardCategoryToCategoryData(category: DashboardCategory): CategoryData {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: category.productCount,
  };
}

export function formatNAD(cents: number): string {
  return `N$ ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export const ALL_AVAILABILITY = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "sold_out", label: "Out of Stock" },
];
export const ALL_CONDITIONS = ["New", "Refurbished", "Pre-Owned"];
