"use client";

import { MessageCircle, Phone, ShieldCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

const trustBadges = [
  { label: "Quality Tested", icon: ShieldCheck },
  { label: "Reliable Support", icon: ShieldCheck },
  { label: "Best Prices", icon: ShieldCheck },
  { label: "Secure Purchase", icon: ShieldCheck },
];

export function HeroSection() {
  const [heroImgError, setHeroImgError] = useState(false);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16 py-10 lg:py-20">
          {/* Left: Content */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent/50 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                Namibia&apos;s Trusted Tech Partner
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              Your trusted tech partner in{" "}
              <span className="text-primary">Namibia.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
              New, pre-used and refurbished technology — from laptops and
              smartphones to security, networking and POS solutions.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-whatsapp px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-whatsapp-hover hover:shadow-lg hover:shadow-whatsapp/25 active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-md active:scale-[0.98]"
              >
                <Phone className="h-5 w-5" />
                {PHONE_NUMBER}
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {trustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="flex-1 lg:flex lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-border shadow-xl">
              {!heroImgError ? (
                <img
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop"
                  alt="Premium tech products"
                  className="w-full h-full object-cover"
                  onError={() => setHeroImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8" />
                  <span className="text-sm font-medium">Image unavailable</span>
                </div>
              )}

              {/* Floating badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 px-4 py-3 shadow-lg">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-whatsapp to-whatsapp-hover flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    Trusted by customers across Namibia
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Quality checked • Free consultation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
