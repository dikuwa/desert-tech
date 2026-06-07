import type { Product, ProductImage, Category } from "@/lib/generated/prisma/client";
import type { DashboardProduct } from "@/lib/dashboard-data";

export function slugifyProduct(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type ProductWithImages = Product & {
  category: Category;
  images: ProductImage[];
};

export function productRecordToDashboardProduct(product: ProductWithImages): DashboardProduct {
  const orderedImages = product.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.url);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category.name,
    brand: product.brand ?? "",
    priceCents: product.priceCents,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    availability: product.availability,
    condition: product.condition,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt.toISOString().split("T")[0],
    imageUrl: orderedImages[0] ?? "",
    images: orderedImages,
    sku: product.sku ?? undefined,
    description: product.description ?? undefined,
    warranty: product.warranty ?? undefined,
    compareAtPriceCents: product.compareAtPriceCents ?? undefined,
  };
}

export function normalizeProductImages(images?: string[], fallback?: string) {
  return Array.from(new Set([...(images ?? []), fallback].filter(Boolean) as string[]));
}
