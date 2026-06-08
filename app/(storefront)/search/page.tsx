"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { ProductData } from "@/components/storefront/product-card";
import { useDashboardStore } from "@/lib/store/dashboard";
import { mergeProducts } from "@/lib/data";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const products = useDashboardStore((s) => s.products);
  const categories = useDashboardStore((s) => s.categories);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const allProducts = mergeProducts(products, categories);
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q),
    );
  }, [query, products, categories]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Shop
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {query ? (
            <>
              Search results for &ldquo;{query}&rdquo;
            </>
          ) : (
            "Search Products"
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {query
            ? `${results.length} product${results.length !== 1 ? "s" : ""} found`
            : "Enter a search term to find products"}
        </p>
      </div>

      {!query.trim() ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Search our catalog</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Use the search bar in the header to find products by name, brand, or category.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <X className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground">No results for &ldquo;{query}&rdquo;</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Try adjusting your search terms or browse our categories to find what you&apos;re looking for.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((product: ProductData) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
