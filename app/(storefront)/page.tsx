"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, BadgePercent, Clock3, ShieldCheck, Truck } from "lucide-react";
import { HeroSection } from "@/components/storefront/hero-section";
import { CategoryCards } from "@/components/storefront/category-cards";
import { ProductCard } from "@/components/storefront/product-card";
import { TrustSection } from "@/components/storefront/trust-section";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { mergeProducts } from "@/lib/data";
import { useDashboardStore } from "@/lib/store/dashboard";
import { useMemo } from "react";

const FeaturedPromotionsCarousel = dynamic(
  () => import("@/components/storefront/featured-promotions-carousel").then((m) => ({ default: m.FeaturedPromotionsCarousel })),
  { loading: () => <div className="h-64 animate-pulse rounded-xl bg-muted" /> }
);

const WhatsAppCTA = dynamic(
  () => import("@/components/storefront/whatsapp-cta").then((m) => ({ default: m.WhatsAppCTA })),
  { loading: () => <div className="h-24 animate-pulse rounded-xl bg-muted" /> }
);

const serviceNotes = [
  { label: "New, refurbished and pre-owned", icon: BadgePercent },
  { label: "Fast local assistance", icon: Clock3 },
  { label: "Warranty options", icon: ShieldCheck },
  { label: "Nationwide courier available", icon: Truck },
];

export default function HomePage() {
  const dashboardProducts = useDashboardStore((s) => s.products);
  const managedCategories = useDashboardStore((s) => s.categories);
  const allProducts = useMemo(
    () => mergeProducts(dashboardProducts, managedCategories),
    [dashboardProducts, managedCategories]
  );
  const featuredProducts = allProducts.filter(p => p.isFeatured).slice(0, 8);
  return (
    <div>
      <HeroSection />
      <CategoryCards />
      <section className="bg-muted py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Ready to buy
              </p>
              <h2 className="mt-1 text-3xl font-semibold text-foreground">
                Featured products
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                A quick view of popular stock across computers, phones, gaming, security and accessories.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {serviceNotes.map((note) => {
              const Icon = note.icon;
              return (
                <div key={note.label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {note.label}
                </div>
              );
            })}
          </div>

          <ErrorBoundary fallback={<p className="text-sm text-muted-foreground py-8 text-center">Failed to load featured products.</p>}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </ErrorBoundary>
        </div>
      </section>
      <ErrorBoundary fallback={<p className="text-sm text-muted-foreground py-8 text-center">Failed to load promotions.</p>}>
        <FeaturedPromotionsCarousel />
      </ErrorBoundary>
      <TrustSection />
      <WhatsAppCTA />
    </div>
  );
}
