"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

const DEFAULT_HEADING = "Namibia&rsquo;s tech — tested, warranted, and a message away.";
const DEFAULT_SUBHEADING =
  "Shop laptops, phones, gaming builds, CCTV, networking and POS gear with clear pricing, tested stock and direct local assistance.";
const DEFAULT_IMAGE = "/images/DTC-BG.webp";

export function HeroSection() {
  // Read settings from the shared zustand store (persisted to localStorage).
  // Falls back to hardcoded defaults if the store hasn't been configured yet.
  const settings = useDashboardStore((s) => s.settings);

  const heading = settings.heroHeading || DEFAULT_HEADING;
  const subheading = settings.heroSubheading || DEFAULT_SUBHEADING;
  const imageUrl = settings.heroImageUrl || DEFAULT_IMAGE;
  const whatsapp = settings.whatsapp || WHATSAPP_NUMBER;
  const phone = settings.phone || PHONE_NUMBER;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:px-8 lg:py-12">
        {/* Image first on mobile, second on desktop */}
        <div className="min-w-0 -mr-4 sm:-mr-6 lg:-mr-8 -mb-8 lg:-mb-12 overflow-hidden lg:order-2">
          <img
            src={imageUrl}
            alt="Desert Tech electronics showroom"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text second on mobile, first on desktop */}
        <div className="flex flex-col justify-center lg:order-1">
          <div className="mb-5 inline-flex w-fit items-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs">
            Desert Technology Consultant, Namibia
          </div>

          {/* Admin-controlled heading rendered with HTML entities support for &rsquo; etc. */}
          <h1
            className="max-w-2xl text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl"
            dangerouslySetInnerHTML={{ __html: heading }}
          />

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {subheading}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0"
            >
              Shop products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp-soft hover:text-whatsapp active:translate-y-0"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp an expert
            </a>
          </div>

          {/* Trust indicators - centered mini feature cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[
              { label: "Tested stock", icon: ShieldCheck },
              { label: "Warranty options", icon: BadgeCheck },
              { label: "Nationwide courier", icon: Truck },
              { label: "Call us", sub: phone, icon: Phone },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2.5 text-center"
                >
                  <span
                    className="flex items-center justify-center rounded-lg bg-muted text-primary border border-black/[0.04]"
                    style={{
                      width: "44px",
                      height: "44px",
                      minWidth: "44px",
                      minHeight: "44px",
                      flexShrink: 0,
                      aspectRatio: "1 / 1",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="text-sm font-medium leading-tight text-muted-foreground">
                    <span>{item.label}</span>
                    {item.sub && <span className="block text-xs">{item.sub}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
