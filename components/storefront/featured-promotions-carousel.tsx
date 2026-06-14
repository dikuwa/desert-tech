"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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

function PromotionCard({
  promo,
  onImageReady,
}: {
  promo: PromoCard;
  onImageReady?: (promoId: string) => void;
}) {
  const href = getPromotionHref(promo);
  const cta = getPromotionCta(promo);

  return (
    <Link
      href={href}
      className={cn(
        "group grid overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_12px_40px_rgba(0,0,0,0.035)] transition-all duration-500",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(0,0,0,0.055)] active:translate-y-0",
        "grid-cols-1 md:grid-cols-[2fr_3fr]",
      )}
    >
      {/* Image - full visibility using contain, soft background */}
      <div className="relative order-last flex h-[280px] items-center justify-center bg-muted/25 p-4 sm:h-[340px] sm:p-5 md:h-[380px] md:p-6 lg:h-[420px]">
        {promo.imageUrl ? (
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="h-full w-full object-contain"
            onLoad={() => onImageReady?.(promo.id)}
            onError={() => onImageReady?.(promo.id)}
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
      <div className="order-first flex flex-col justify-center p-7 sm:p-9 lg:p-11">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
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

  const totalSlides = promotions.length;

  // Build the infinite slide array: [lastClone, ...originals, firstClone]
  const slides = totalSlides > 1
    ? [promotions[totalSlides - 1], ...promotions, promotions[0]]
    : promotions;

  const [activeIndex, setActiveIndex] = useState(totalSlides > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [readyPromotionIds, setReadyPromotionIds] = useState<Set<string>>(
    () => new Set(promotions.filter((promo) => !promo.imageUrl).map((promo) => promo.id)),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  // The "real" index (0-based in original array)
  const realIndex = totalSlides > 1
    ? ((activeIndex - 1) % totalSlides + totalSlides) % totalSlides
    : 0;
  const currentPromotion = promotions[realIndex];
  const isCurrentSlideReady = Boolean(
    currentPromotion && (!currentPromotion.imageUrl || readyPromotionIds.has(currentPromotion.id)),
  );

  const goToSlide = useCallback((rawIdx: number, animate = true) => {
    if (totalSlides <= 1) return;
    setIsTransitioning(animate);
    setActiveIndex(rawIdx);
    setIsPaused(false);
  }, [totalSlides]);

  const handleImageReady = useCallback((promoId: string) => {
    setReadyPromotionIds((current) => {
      if (current.has(promoId)) return current;
      const next = new Set(current);
      next.add(promoId);
      return next;
    });
  }, []);

  const pauseIfReady = useCallback(() => {
    if (isCurrentSlideReady) setIsPaused(true);
  }, [isCurrentSlideReady]);

  const goNext = useCallback(() => {
    if (totalSlides <= 1) return;
    goToSlide(activeIndex + 1);
  }, [goToSlide, activeIndex, totalSlides]);

  const goPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    goToSlide(activeIndex - 1);
  }, [goToSlide, activeIndex, totalSlides]);

  // Seamless loop: after transition ends, jump without animation
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    // Only respond to the track's own transform transition, not bubbled events from children
    if (e.propertyName !== "transform" || e.target !== e.currentTarget) return;
    if (totalSlides <= 1) return;
    // If at the clone of the first slide (end), jump to real first slide
    if (activeIndex === totalSlides + 1) {
      setIsTransitioning(false);
      setActiveIndex(1);
      // Force reflow so the browser applies the no-transition jump
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
    // If at the clone of the last slide (beginning), jump to real last slide
    if (activeIndex === 0) {
      setIsTransitioning(false);
      setActiveIndex(totalSlides);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
  }, [activeIndex, totalSlides]);

  // Auto-slide
  const AUTO_INTERVAL = 7000;

  useEffect(() => {
    if (totalSlides <= 1) return;
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      goNext();
    }, AUTO_INTERVAL);

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

  // Single slide — no carousel
  if (totalSlides === 1) {
    return (
      <section className="bg-background py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Limited offers
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Featured promotions
            </h2>
          </div>
          <PromotionCard promo={promotions[0]} />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Limited offers
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Featured promotions
            </h2>
          </div>
          {/* Desktop arrow controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Previous promotion"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Next promotion"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative overflow-hidden rounded-2xl"
          onMouseEnter={pauseIfReady}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={pauseIfReady}
          onBlur={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide track */}
          <div
            ref={trackRef}
            className="flex"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
              transition: isTransitioning
                ? "transform 800ms cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((promo, idx) => (
              <div key={`${promo.id}-${idx}`} className="w-full flex-shrink-0">
                <PromotionCard promo={promo} onImageReady={handleImageReady} />
              </div>
            ))}
          </div>

          {/* Decorative gradient edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        </div>

        {/* Pagination dots + mobile arrows */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={goPrev}
            className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Previous promotion"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            {promotions.map((promo, idx) => (
              <button
                key={promo.id}
                onClick={() => goToSlide(idx + 1)}
                className={cn(
                  "rounded-full transition-all duration-500",
                  idx === realIndex
                    ? "h-2 w-5 bg-primary/80"
                    : "h-2 w-2 bg-border/70 hover:bg-muted-foreground/30",
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
      </div>
    </section>
  );
}
