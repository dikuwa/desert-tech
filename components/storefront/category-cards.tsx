"use client";

import Link from "next/link";
import {
  Monitor,
  Smartphone,
  Gamepad2,
  Camera,
  Wifi,
  Headphones,
} from "lucide-react";
import { useRef } from "react";

const categories = [
  { label: "Laptops & PCs", href: "/shop?category=windows", icon: Monitor, count: "45+", note: "Work, study, business" },
  { label: "Phones & Tablets", href: "/shop?category=phones", icon: Smartphone, count: "30+", note: "Daily drivers" },
  { label: "Gaming", href: "/shop?category=gaming", icon: Gamepad2, count: "20+", note: "Ready-to-play builds" },
  { label: "Security & CCTV", href: "/shop?category=cctv", icon: Camera, count: "25+", note: "Home and business" },
  { label: "Networking", href: "/shop?category=networking", icon: Wifi, count: "18+", note: "WiFi, routers, cabling" },
  { label: "Accessories", href: "/shop?category=accessories", icon: Headphones, count: "50+", note: "Everyday upgrades" },
];

export function CategoryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Find the right shelf
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Shop by category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6 pt-2"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group relative flex w-[220px] shrink-0 snap-start flex-col rounded-lg border border-border bg-background p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:z-10 hover:border-primary/30 active:translate-y-0 active:shadow-sm md:w-auto"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {cat.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {cat.note}
                  </span>
                  <span className="mt-4 block text-xs font-semibold text-primary">
                    {cat.count} items
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
