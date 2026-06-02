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
import { cn } from "@/lib/utils";

const categories = [
  { label: "Laptops & PCs", href: "/shop?category=laptops", icon: Monitor, count: "45+" },
  { label: "Phones & Tablets", href: "/shop?category=phones", icon: Smartphone, count: "30+" },
  { label: "Gaming", href: "/shop?category=gaming", icon: Gamepad2, count: "20+" },
  { label: "Security & CCTV", href: "/shop?category=cctv", icon: Camera, count: "25+" },
  { label: "Networking", href: "/shop?category=networking", icon: Wifi, count: "18+" },
  { label: "Accessories", href: "/shop?category=accessories", icon: Headphones, count: "50+" },
];

export function CategoryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-10 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-row md:flex-col items-center gap-3 md:gap-3 md:text-center rounded-xl border border-border bg-card p-3 md:p-5 transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] shrink-0 w-[200px] md:w-auto snap-start"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-muted group-hover:bg-accent transition-colors">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 md:text-center min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">
                    {cat.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
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
