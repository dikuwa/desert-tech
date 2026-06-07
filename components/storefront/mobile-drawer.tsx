"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  X,
  Home,
  ShoppingBag,
  Wrench,
  Phone,
  LayoutGrid,
  Apple,
  Laptop,
  Gamepad2,
  ShieldCheck,
  Receipt,
  Headphones,
  Search,
  ArrowRight,
  Tag,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/lib/store/mobile-menu";
import { useCart } from "@/lib/store/cart";
import { searchProducts, formatNAD } from "@/lib/data";
import { useDashboardStore } from "@/lib/store/dashboard";

const navIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/shop": ShoppingBag,
  "/promotions": Tag,
  "/services": Wrench,
  "/contact": Phone,
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "All Products": LayoutGrid,
  "Apple": Apple,
  "Windows": Laptop,
  "Gaming": Gamepad2,
  "CCTV & Security": ShieldCheck,
  "POS Systems": Receipt,
  "Accessories": Headphones,
  "Auto Services": Wrench,
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/promotions", label: "Promotions" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileMenu();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const managedCategories = useDashboardStore((state) => state.categories);
  const categories = [
    { href: "/shop", label: "All Products" },
    ...managedCategories
      .filter((category) => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({ href: `/shop?category=${category.slug}`, label: category.name })),
  ];
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live search
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchProducts(searchQuery.trim()));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] md:hidden transition-opacity duration-300 ease-out",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      onClick={close}
    >
      {/* Drawer panel */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-[88vw] max-w-[420px] bg-[#fbf8f3] border-l border-[#e7dfd5] shadow-2xl flex flex-col overflow-y-auto rounded-l-lg transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0 sticky top-0 bg-[#fbf8f3] z-10">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={close}
          >
            <img
              src="/images/desert-tech-logo.svg"
              alt="Desert Tech"
              className="h-8 w-auto"
            />
            <span className="text-base font-bold text-foreground">DesertTech</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/cart"
              className="flex items-center justify-center h-11 w-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              onClick={close}
            >
              <ShoppingCart className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-[#fbf8f3]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={close}
              className="flex items-center justify-center h-11 w-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close menu"
              autoFocus
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-xl border border-[#e7dfd5] bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-[#e7dfd5] bg-white shadow-lg max-h-64 overflow-y-auto">
                {searchResults.slice(0, 6).map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    onClick={() => { close(); setSearchQuery(""); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatNAD(product.priceCents)}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
                {searchResults.length > 6 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { close(); setSearchQuery(""); }}
                    className="flex items-center justify-center gap-1 border-t border-border px-3 py-2.5 text-xs font-medium text-primary hover:bg-muted transition-colors"
                  >
                    View all {searchResults.length} results
                  </Link>
                )}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-[#e7dfd5] bg-white shadow-lg px-3 py-4 text-center text-sm text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* Navigation content */}
        <div className="flex-1 px-5 pb-6">
          {/* Main links */}
          <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Menu
          </p>
          <nav className="space-y-0.5">
            {navLinks.map((link) => {
              const Icon = navIcons[link.href];
              const isActive =
                (link.href === "/" && pathname === "/") ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#f5e6d0] text-primary"
                      : "text-muted-foreground hover:bg-[#f5e6d0] hover:text-primary",
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Categories */}
          <div className="mt-6 pt-4 border-t border-[#e7dfd5]">
            <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Categories
            </p>
            <nav className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.label];
                return (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      "text-muted-foreground hover:bg-[#f5e6d0] hover:text-primary",
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{cat.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
