"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  MessageCircle,
  Search,
  BadgeCheck,
} from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

const categories = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?category=apple", label: "Apple Products" },
  { href: "/shop?category=windows", label: "Windows Laptops" },
  { href: "/shop?category=gaming", label: "Gaming PC" },
  { href: "/shop?category=cctv", label: "CCTV & Security" },
  { href: "/shop?category=networking", label: "Networking" },
  { href: "/shop?category=pos", label: "POS Systems" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/promotions", label: "Promotions" },
  { href: "/shop?category=mechanics", label: "Mechanics" },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/promotions", label: "Promotions" },
  { href: "/contact", label: "Contact" },
];

export function StorefrontHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  const handleSearch = useCallback((e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
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
          <div className="flex items-center gap-4">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-1 font-semibold text-white/90 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{PHONE_NUMBER}</span>
            </a>
            <span className="hidden sm:block text-white/30">|</span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 font-semibold text-white/90 hover:text-white transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
          <div className="flex items-center gap-1 font-medium text-white/80">
            <span>Cash at store or Bank Transfer</span>
            <span className="hidden sm:inline">, Standard Bank</span>
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
            <div className="relative w-full">
              <button onClick={handleSearch} className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products, brands or categories..."
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp-soft hover:text-whatsapp active:translate-y-0 lg:flex"
            >
              <BadgeCheck className="h-4 w-4 text-whatsapp" />
              Ask expert
            </a>
            <Link
              href="/cart"
              className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
              <span className="sr-only">Cart ({itemCount} items)</span>
            </Link>

            <button
              className="flex md:hidden items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

      {mobileMenuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <button onClick={handleSearch} className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <nav className="flex flex-col px-4 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setActiveCategory(cat.label);
                    setMobileMenuOpen(false);
                  }}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border mt-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-whatsapp/20 bg-whatsapp-soft px-3 py-2.5 text-sm font-medium text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-foreground"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
