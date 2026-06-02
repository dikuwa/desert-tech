"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

const filterGroups: FilterGroup[] = [
  {
    id: "category",
    label: "All Products",
    options: [
      { value: "all", label: "All Products" },
      { value: "apple", label: "Apple Products" },
      { value: "windows", label: "Windows Laptops" },
      { value: "gaming", label: "Gaming PC" },
      { value: "cctv", label: "CCTV & Security" },
      { value: "networking", label: "Networking" },
      { value: "pos", label: "POS Systems" },
      { value: "accessories", label: "Accessories" },
      { value: "mechanics", label: "Mechanics" },
    ],
  },
  {
    id: "brand",
    label: "All Brands",
    options: [
      { value: "all", label: "All Brands" },
      { value: "apple", label: "Apple" },
      { value: "dell", label: "Dell" },
      { value: "hp", label: "HP" },
      { value: "lenovo", label: "Lenovo" },
      { value: "asus", label: "ASUS" },
      { value: "samsung", label: "Samsung" },
      { value: "hikvision", label: "Hikvision" },
    ],
  },
  {
    id: "price",
    label: "Price Range",
    options: [
      { value: "all", label: "All Prices" },
      { value: "0-5000", label: "Under N$ 5,000" },
      { value: "5000-10000", label: "N$ 5,000 - N$ 10,000" },
      { value: "10000-20000", label: "N$ 10,000 - N$ 20,000" },
      { value: "20000+", label: "Over N$ 20,000" },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    options: [
      { value: "all", label: "All Items" },
      { value: "in_stock", label: "In Stock" },
      { value: "low_stock", label: "Low Stock" },
      { value: "sold_out", label: "Sold Out" },
    ],
  },
  {
    id: "sort",
    label: "Sort by Featured",
    options: [
      { value: "featured", label: "Featured" },
      { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
      { value: "rating", label: "Highest Rated" },
    ],
  },
];

interface ProductFiltersProps {
  onFilterChange?: (filters: Record<string, string>) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({
    category: "all",
    brand: "all",
    price: "all",
    availability: "all",
    sort: "featured",
  });

  const handleSelect = (groupId: string, value: string) => {
    const newSelected = { ...selected, [groupId]: value };
    setSelected(newSelected);
    setOpenDropdown(null);
    onFilterChange?.(newSelected);
  };

  const handleClear = () => {
    const defaults = {
      category: "all",
      brand: "all",
      price: "all",
      availability: "all",
      sort: "featured",
    };
    setSelected(defaults);
    onFilterChange?.(defaults);
  };

  const hasActiveFilters = Object.values(selected).some((v) => v !== "all") || selected.sort !== "featured";

  const getLabel = (group: FilterGroup): string => {
    if (group.id === "sort") {
      const opt = group.options.find((o) => o.value === selected.sort);
      return opt?.label || group.label;
    }
    if (selected[group.id] !== "all") {
      const opt = group.options.find((o) => o.value === selected[group.id]);
      return opt?.label || group.label;
    }
    return group.label;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterGroups.map((group) => (
        <div key={group.id} className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === group.id ? null : group.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              selected[group.id] !== (group.id === "sort" ? "featured" : "all")
                ? "border-primary/30 bg-accent text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/20",
            )}
          >
            {getLabel(group)}
            <ChevronDown className="h-3 w-3" />
          </button>

          {openDropdown === group.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
              <div className="absolute top-full left-0 mt-1 z-20 min-w-[180px] rounded-lg border border-border bg-card shadow-lg p-1">
                {group.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(group.id, opt.value)}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2 text-left text-xs font-medium transition-colors",
                      selected[group.id] === opt.value
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
