"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { useRef } from "react";
import { useDashboardStore } from "@/lib/store/dashboard";

export function CategoryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories = useDashboardStore((state) => state.categories)
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 6);

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
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative flex w-[220px] shrink-0 snap-start flex-col rounded-lg border border-border bg-background p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:z-10 hover:border-primary/30 active:translate-y-0 active:shadow-sm md:w-auto"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-primary">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="mt-5 min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {cat.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {cat.description}
                  </span>
                  <span className="mt-4 block text-xs font-semibold text-primary">
                    {cat.productCount} items
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
