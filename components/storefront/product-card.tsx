"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Bell, Star, ImageOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  specs: string;
  priceCents: number;
  oldPriceCents?: number;
  discountPercent?: number;
  imageUrl?: string;
  availability: "in_stock" | "low_stock" | "sold_out";
  stockCount?: number;
  rating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: ProductData;
}

function formatNAD(cents: number): string {
  return `N$ ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

const availabilityConfig = {
  in_stock: {
    label: "In Stock",
    class: "bg-success-soft text-success border-success/20",
  },
  low_stock: {
    label: (count?: number) => `Low Stock${count ? ` (${count} left)` : ""}`,
    class: "bg-warning-soft text-warning border-warning/20",
  },
  sold_out: {
    label: "Sold Out",
    class: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export function ProductCard({ product }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isSoldOut = product.availability === "sold_out";
  const isLowStock = product.availability === "low_stock";
  const avail = availabilityConfig[product.availability];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card transition-all hover:shadow-md",
        isSoldOut ? "border-gray-200 opacity-70" : "border-border hover:-translate-y-0.5",
      )}
    >
      {/* Discount Badge */}
      {product.discountPercent && !isSoldOut && (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
          -{product.discountPercent}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => setWishlisted(!wishlisted)}
        className={cn(
          "absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-md transition-colors",
          isSoldOut ? "hidden" : "opacity-0 group-hover:opacity-100",
          wishlisted ? "text-destructive" : "text-muted-foreground hover:text-destructive",
        )}
      >
        <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
      </button>

      {/* Availability Badge */}
      <div
        className={cn(
          "absolute top-2 right-2 z-10 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
          isSoldOut && "opacity-0",
          avail.class,
        )}
      >
        {typeof avail.label === "function" ? avail.label(product.stockCount) : avail.label}
      </div>

      {/* Product Image */}
      <div className="aspect-square rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            <span className="text-[11px] font-medium">{product.name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Name */}
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
          <Link href={`/shop/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Specs */}
        <p className="text-xs text-muted-foreground line-clamp-1">{product.specs}</p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-bold text-foreground">
            {formatNAD(product.priceCents)}
          </span>
          {product.oldPriceCents && (
            <span className="text-sm text-muted-foreground line-through">
              {formatNAD(product.oldPriceCents)}
            </span>
          )}
        </div>

        {/* Add to Cart / Notify Me */}
        {isSoldOut ? (
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted">
            <Bell className="h-3.5 w-3.5" />
            Notify Me
          </button>
        ) : (
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-sm">
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
}
