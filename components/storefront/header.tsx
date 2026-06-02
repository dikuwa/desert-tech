"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  MessageCircle,
  Search,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      {/* Top Contact Bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-1 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>{PHONE_NUMBER}</span>
            </a>
            <span className="hidden sm:block text-secondary-foreground/40">|</span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              <span>WhatsApp</span>
            </a>
          </div>
          <div className="flex items-center gap-1 text-secondary-foreground/60">
            <span>Cash at store or Bank Transfer</span>
            <span className="hidden sm:inline"> — Standard Bank</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter text-foreground">
              Desert<span className="text-primary">Tech</span>
            </span>
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands or categories..."
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/wishlist"
              className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="flex md:hidden items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="hidden md:block border-b border-border bg-background">
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
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          {/* Mobile Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Mobile Nav */}
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
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-whatsapp px-3 py-2.5 text-sm font-medium text-white"
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
