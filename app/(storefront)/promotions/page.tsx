"use client";

import Link from "next/link";
import { ArrowRight, Tag, Sparkles, Percent } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";

export default function PromotionsPage() {
  const dashboardPromotions = useDashboardStore((s) => s.promotions);

  const allPromotions = dashboardPromotions
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      discountLabel: p.discountLabel,
      isFeatured: p.isFeatured !== false,
      type: (p.type || "general") as "product" | "bundle" | "service" | "general",
    }));

  const featuredPromos = allPromotions.filter((p) => p.isFeatured);
  const otherPromos = allPromotions.filter((p) => !p.isFeatured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Limited time offers
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Promotions & Specials
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Take advantage of current deals on tech, security, networking, and services across Namibia. 
          Prices and availability are subject to change.
        </p>
      </div>

      {allPromotions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-20 text-center">
          <Tag className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-base font-medium text-foreground">No active promotions right now</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon for new deals and specials.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            Browse Shop
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Featured Promotions */}
      {featuredPromos.length > 0 && (
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Featured</p>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Best deals right now</h2>
            </div>
          </div>
          <div className="grid gap-6">
            {featuredPromos.map((promo) => (
              <Link
                key={promo.id}
                href={`/promotions/${promo.slug}`}
                className="group grid overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:grid-cols-2"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-auto sm:order-last">
                  {promo.imageUrl ? (
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
                      <Tag className="h-8 w-8" />
                    </div>
                  )}
                  {promo.discountLabel && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                      <Percent className="h-3 w-3" />
                      {promo.discountLabel}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-accent/50 px-2.5 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                    {promo.type === "service" ? "Service Offer" : promo.type === "bundle" ? "Bundle Deal" : "Special Offer"}
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-foreground sm:text-xl">
                    {promo.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {promo.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
                    View offer
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other Promotions */}
      {otherPromos.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">More deals</p>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Other specials</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {otherPromos.map((promo) => (
              <Link
                key={promo.id}
                href={`/promotions/${promo.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {promo.imageUrl ? (
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
                      <Tag className="h-8 w-8" />
                    </div>
                  )}
                  {promo.discountLabel && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                      {promo.discountLabel}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="inline-flex w-fit items-center gap-1 rounded-md bg-accent/50 px-2 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {promo.type === "service" ? "Service" : promo.type === "bundle" ? "Bundle" : "Offer"}
                  </div>
                  <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {promo.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {promo.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    View offer
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
