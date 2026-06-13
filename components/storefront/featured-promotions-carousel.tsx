"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { isPublicPromotion } from "@/lib/promotion-visibility";

interface PromoCard {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  discountLabel?: string;
  type: string;
}

function getPromotionHref(promo: PromoCard): string {
  return `/promotions/${promo.slug}`;
}

function getPromotionCta(promo: PromoCard): string {
  switch (promo.type) {
    case "product":
      return "View offer";
    case "bundle":
      return "View bundle";
    case "service":
      return "View offer";
    default:
      return "View offer";
  }
}

function PromotionCard({ promo }: { promo: PromoCard }) {
  const href = getPromotionHref(promo);
  const cta = getPromotionCta(promo);

  return (
    <Link
      href={href}
      className={cn(
        "group grid overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-500",
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        "grid-cols-1 md:grid-cols-2",
      )}
    >
      {/* Image - top on mobile, right on desktop */}
      <div className="relative order-first aspect-[4/3] overflow-hidden bg-gray-100 md:aspect-auto md:order-last">
        {promo.imageUrl ? (
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
            <span className="text-sm font-medium">No image</span>
          </div>
        )}
        {promo.discountLabel && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
            {promo.discountLabel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-accent/50 px-2.5 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
          {promo.type === "service" ? "Service" : "Promotion"}
        </div>
        <h3 className="mt-4 text-xl font-bold leading-snug text-foreground sm:text-2xl">
          {promo.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {promo.description}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function FeaturedPromotionsCarousel() {
  const dashboardPromotions = useDashboardStore((s) => s.promotions);

  // Filter active + featured promotions from the dashboard store
  const promotions: PromoCard[] = dashboardPromotions
    .filter((p) => isPublicPromotion(p) && p.isFeatured !== false)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      discountLabel: p.discountLabel,
      type: p.type || "general",
    }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<number | null>(null);

  const totalSlides = promotions.length;

  const goTo = useCallback((index: number) => {
    if (totalSlides === 0) return;
    setCurrentIndex(((index % totalSlides) + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [goTo, currentIndex]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [goTo, currentIndex]);

  // Auto-slide
  useEffect(() => {
    if (totalSlides <= 1) return;
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      goNext();
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, goNext, totalSlides]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) goPrev();
      else goNext();
    }
    touchStartRef.current = null;
  };

  // Empty state
  if (totalSlides === 0) {
    return null;
  }

  return (
    <section className="bg-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Limited offers
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Featured promotions
            </h2>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative overflow-hidden rounded-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide track */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {promotions.map((promo) => (
              <div key={promo.id} className="w-full flex-shrink-0">
                <PromotionCard promo={promo} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots + mobile arrows */}
        {totalSlides > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Previous promotion"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {promotions.map((promo, idx) => (
                <button
                  key={promo.id}
                  onClick={() => goTo(idx)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    idx === currentIndex
                      ? "h-2.5 w-6 bg-primary"
                      : "h-2.5 w-2.5 bg-border hover:bg-muted-foreground/40",
                  )}
                  aria-label={`Go to promotion ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Next promotion"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
