"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  MessageCircle,
  Mail,
  Search,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { useMobileMenu } from "@/lib/store/mobile-menu";
import { searchProducts, formatNAD } from "@/lib/data";
import { CartDropdown } from "@/components/storefront/cart-dropdown";
import { useDashboardStore } from "@/lib/store/dashboard";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/promotions", label: "Promotions" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function StorefrontHeader() {
  const router = useRouter();
  const settings = useDashboardStore((s) => s.settings);
  const contactDetails = useDashboardStore((s) => s.contactDetails);
  const paymentMethods = useDashboardStore((s) => s.paymentMethods);
  const bankDetails = useDashboardStore((s) => s.bankDetails);
  const managedCategories = useDashboardStore((s) => s.categories);
  const categories = [
    { href: "/shop", label: "All Products" },
    ...managedCategories
      .filter((category) => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({ href: `/shop?category=${category.slug}`, label: category.name })),
    { href: "/promotions", label: "Promotions" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];
  const whatsapp = settings.whatsapp || WHATSAPP_NUMBER;
  const phone = settings.phone || PHONE_NUMBER;
  const activePayments = paymentMethods.filter((p) => p.isActive);
  const { isOpen: mobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProducts>>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  // Live search as user types
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchProducts(searchQuery.trim()));
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile menu: body scroll lock, blur class
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-menu-open");

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileMenuOpen]);

  const handleSearch = useCallback((e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/shop");
    }
  }, [searchQuery, router]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-[#0d41e1] text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 font-semibold text-white/90 hover:text-white transition-colors shrink-0"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{phone}</span>
            </a>
            <span className="text-white/30">|</span>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-white/90 hover:text-white transition-colors shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>
            {/* Show additional contacts if available (hidden on small screens) */}
            {contactDetails.filter(c => c.isActive && c.type !== "phone" && c.type !== "whatsapp").length > 0 && (
              <>
                <span className="hidden sm:block text-white/30">|</span>
                {contactDetails.filter(c => c.isActive && c.type === "email").slice(0, 1).map(c => (
                  <a key={c.id} href={`mailto:${c.value}`} className="hidden sm:flex items-center gap-1 font-medium text-white/70 hover:text-white transition-colors shrink-0">
                    <Mail className="h-3 w-3" />
                    <span className="whitespace-nowrap">{c.value}</span>
                  </a>
                ))}
              </>
            )}
          </div>
          {/* Payment method tags - right side, hidden on mobile, no width constraint */}
          <div className="hidden sm:flex items-center gap-1">
            {activePayments.length > 0 ? (
              <div className="flex items-center gap-1">
                {activePayments.map(pm => (
                  <span
                    key={pm.id}
                    className="inline-flex rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/80 whitespace-nowrap"
                  >
                    {pm.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] font-medium text-white/70 whitespace-nowrap">Cash or Bank Transfer</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            <img
              src="/images/desert-tech-logo.svg"
              alt="Desert Tech"
              className="h-9 w-auto"
            />
            <span className="leading-tight">
              <span className="block text-lg font-bold text-foreground">DesertTech</span>
              <span className="hidden text-[11px] font-semibold text-primary sm:block">
                Electronics retail
              </span>
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full" ref={searchRef}>
              <button onClick={handleSearch} className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products, brands or categories..."
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
              {/* Live search dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-card shadow-lg max-h-80 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No results found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <div className="py-1">
                      {searchResults.slice(0, 8).map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.slug}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        >
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 flex-shrink-0 rounded-md object-cover border border-border"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand} &middot; {product.categoryName}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground flex-shrink-0">
                            {formatNAD(product.priceCents)}
                          </span>
                        </Link>
                      ))}
                      {searchResults.length > 8 && (
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center justify-center gap-1 border-t border-border px-4 py-2.5 text-xs font-medium text-primary hover:bg-muted transition-colors"
                        >
                          View all {searchResults.length} results
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp-soft hover:text-whatsapp active:translate-y-0 lg:flex"
            >
              <BadgeCheck className="h-4 w-4 text-whatsapp" />
              Ask expert
            </a>
            <CartDropdown />

            <button
              className="flex md:hidden items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-0">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                onClick={() => setActiveCategory(cat.label)}
                className={cn(
                  "relative whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
                  activeCategory === cat.label
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                )}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* The mobile drawer is rendered outside <header> in the layout */}
    </header>
  );
}
