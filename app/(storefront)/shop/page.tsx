"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { ProductData } from "@/components/storefront/product-card";
import { cn } from "@/lib/utils";
import {
  dashboardCategoryToCategoryData,
  ALL_CONDITIONS,
  filterProducts,
  mergeProducts,
} from "@/lib/data";
import { useDashboardStore } from "@/lib/store/dashboard";
import { getActiveCategories } from "@/lib/storefront-navigation";

const ALL_AVAILABILITY = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "sold_out", label: "Out of Stock" },
];

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

function ShopFilterSection({
  title,
  isActive,
  isCollapsed,
  onToggle,
  children,
  scroll = false,
}: {
  title: string;
  isActive: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors",
          isActive ? "bg-accent/50 text-primary" : "text-foreground hover:bg-muted",
        )}
      >
        <span>{title}</span>
        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
      {!isCollapsed && (
        <div className={cn("space-y-0.5 px-2 pb-3", scroll && "max-h-60 overflow-y-auto")}>
          {children}
        </div>
      )}
    </div>
  );
}

function ShopFilterOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-accent font-semibold text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <span>{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </button>
  );
}

function ShopContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const managedBrands = useDashboardStore((s) => s.brands);
  const managedCategories = useDashboardStore((s) => s.categories);
  const dashboardProducts = useDashboardStore((s) => s.products);
  const [selectedBrand, setSelectedBrand] = useState("all");

  // Merge static products with dashboard-created products using real category data
  const allProducts = useMemo(
    () => mergeProducts(dashboardProducts, managedCategories),
    [dashboardProducts, managedCategories]
  );
  const categories = useMemo(
    () => getActiveCategories(managedCategories).map(dashboardCategoryToCategoryData),
    [managedCategories],
  );

  // Use active dashboard-managed brands as the public filter source.
  const BRANDS = useMemo(() => {
    return managedBrands.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(b => b.name);
  }, [managedBrands]);
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedSort, setSelectedSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [collapsedFilters, setCollapsedFilters] = useState<Record<string, boolean>>({
    category: false,
    brand: false,
    availability: false,
    condition: false,
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const category = searchParams.get("category");
    setSelectedCategory(category || "all");

    const brand = searchParams.get("brand");
    setSelectedBrand(brand || "all");

    const condition = searchParams.get("condition");
    setSelectedCondition(condition || "all");

    const sort = searchParams.get("sort");
    setSelectedSort(sort || "featured");

    const availability = searchParams.get("availability");
    setSelectedAvailability(availability || "all");

    const q = searchParams.get("q");
    setSearchQuery(q || "");

    setCurrentPage(1);
  }, [searchParams]);

  const toggleFilter = (key: string) => {
    setCollapsedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = useMemo(() => {
    return filterProducts({
      search: searchQuery || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      brand: selectedBrand !== "all" ? selectedBrand : undefined,
      availability: selectedAvailability !== "all" ? selectedAvailability : undefined,
      condition: selectedCondition !== "all" ? selectedCondition : undefined,
      sort: selectedSort,
    }, allProducts);
  }, [searchQuery, selectedCategory, selectedBrand, selectedAvailability, selectedCondition, selectedSort, allProducts]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    selectedAvailability !== "all" ||
    selectedCondition !== "all";

  const clearFilters = useCallback(() => {
    router.push("/shop");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedAvailability("all");
    setSelectedCondition("all");
    setSearchQuery("");
    setCurrentPage(1);
  }, [router]);

  const updateQuery = useCallback((key: string, value: string, defaultValue = "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue || !value) params.delete(key);
    else params.set(key, value);
    router.push(params.size ? `/shop?${params.toString()}` : "/shop", { scroll: false });
  }, [router, searchParams]);

  const handleCategoryChange = (slug: string) => {
    updateQuery("category", slug);
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleBrandChange = (brand: string) => {
    updateQuery("brand", brand);
    setSelectedBrand(brand);
    setCurrentPage(1);
  };

  const handleAvailabilityChange = (avail: string) => {
    updateQuery("availability", avail);
    setSelectedAvailability(avail);
    setCurrentPage(1);
  };

  const handleConditionChange = (cond: string) => {
    updateQuery("condition", cond);
    setSelectedCondition(cond);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    updateQuery("sort", sort, "featured");
    setSelectedSort(sort);
  };

  const handleSearchChange = (query: string) => {
    updateQuery("q", query, "");
    setSearchQuery(query);
  };

  // Category stats — only show categories with products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length };
    categories.forEach((cat) => {
      counts[cat.slug] = allProducts.filter((p) => p.categorySlug === cat.slug).length;
    });
    return counts;
  }, [allProducts, categories]);

  // Categories with at least 1 product
  const categoriesWithProducts = useMemo(
    () => categories.filter((cat) => (categoryCounts[cat.slug] || 0) > 0),
    [categories, categoryCounts],
  );

  // Brand stats — only show brands with products
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length };
    BRANDS.forEach((brand) => {
      counts[brand] = allProducts.filter((p) => p.brand.toLowerCase() === brand.toLowerCase()).length;
    });
    return counts;
  }, [allProducts, BRANDS]);

  // Brands with at least 1 product
  const brandsWithProducts = useMemo(
    () => BRANDS.filter((brand) => (brandCounts[brand] || 0) > 0),
    [BRANDS, brandCounts],
  );

  const FilterSidebar = () => (
    <div className="space-y-4">
      {/* Category Filter */}
      <ShopFilterSection
        title="Category"
        isActive={selectedCategory !== "all"}
        isCollapsed={collapsedFilters.category}
        onToggle={() => toggleFilter("category")}
      >
        <ShopFilterOption
          label="All Products"
          count={categoryCounts.all}
          active={selectedCategory === "all"}
          onClick={() => handleCategoryChange("all")}
        />
        {categoriesWithProducts.map((cat) => (
          <ShopFilterOption
            key={cat.slug}
            label={cat.name}
            count={categoryCounts[cat.slug] || 0}
            active={selectedCategory === cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
          />
        ))}
      </ShopFilterSection>

      {/* Brand Filter */}
      <ShopFilterSection
        title="Brand"
        isActive={selectedBrand !== "all"}
        isCollapsed={collapsedFilters.brand}
        onToggle={() => toggleFilter("brand")}
        scroll
      >
        <ShopFilterOption
          label="All Brands"
          count={brandCounts.all}
          active={selectedBrand === "all"}
          onClick={() => handleBrandChange("all")}
        />
        {brandsWithProducts.map((brand) => (
          <ShopFilterOption
            key={brand}
            label={brand}
            count={brandCounts[brand] || 0}
            active={selectedBrand === brand}
            onClick={() => handleBrandChange(brand)}
          />
        ))}
      </ShopFilterSection>

      {/* Availability Filter */}
      <ShopFilterSection
        title="Availability"
        isActive={selectedAvailability !== "all"}
        isCollapsed={collapsedFilters.availability}
        onToggle={() => toggleFilter("availability")}
      >
        <ShopFilterOption
          label="All Items"
          active={selectedAvailability === "all"}
          onClick={() => handleAvailabilityChange("all")}
        />
        {ALL_AVAILABILITY.map((avail) => (
          <ShopFilterOption
            key={avail.value}
            label={avail.label}
            active={selectedAvailability === avail.value}
            onClick={() => handleAvailabilityChange(avail.value)}
          />
        ))}
      </ShopFilterSection>

      {/* Condition Filter */}
      <ShopFilterSection
        title="Condition"
        isActive={selectedCondition !== "all"}
        isCollapsed={collapsedFilters.condition}
        onToggle={() => toggleFilter("condition")}
      >
        <ShopFilterOption
          label="All Conditions"
          active={selectedCondition === "all"}
          onClick={() => handleConditionChange("all")}
        />
        {ALL_CONDITIONS.map((cond) => (
          <ShopFilterOption
            key={cond}
            label={cond}
            active={selectedCondition === cond}
            onClick={() => handleConditionChange(cond)}
          />
        ))}
      </ShopFilterSection>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Shop Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex lg:hidden items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                !
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {SORT_OPTIONS.find((o) => o.value === selectedSort)?.label || "Sort"}
              <ChevronDown className="h-4 w-4" />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[200px] rounded-lg border border-border bg-card shadow-lg p-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleSortChange(opt.value);
                        setShowSort(false);
                      }}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedSort === opt.value
                          ? "bg-accent text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-background border-r border-border overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Filters</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchChange(e.target.value);
              }}
              placeholder="Search by name, brand, or category..."
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleSearchChange("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent text-primary px-2.5 py-1 text-xs font-medium">
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button onClick={() => handleCategoryChange("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedBrand !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent text-primary px-2.5 py-1 text-xs font-medium">
                  {selectedBrand}
                  <button onClick={() => handleBrandChange("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedAvailability !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent text-primary px-2.5 py-1 text-xs font-medium">
                  {ALL_AVAILABILITY.find((a) => a.value === selectedAvailability)?.label}
                  <button onClick={() => handleAvailabilityChange("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedCondition !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-accent text-primary px-2.5 py-1 text-xs font-medium">
                  {selectedCondition}
                  <button onClick={() => handleConditionChange("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Empty state */}
          {paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No products found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {paginatedProducts.map((product: ProductData) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, idx, arr) => {
                        const content = (
                           <>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {page}
                            </button>
                          </>
                        );
                        return <div key={page}>{content}</div>;
                      })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
        <p>Loading catalog...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
