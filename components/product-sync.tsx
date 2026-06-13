"use client";

import { useEffect } from "react";
import type { DashboardProduct } from "@/lib/dashboard-data";
import { useDashboardStore } from "@/lib/store/dashboard";

export function ProductSync() {
  const syncProducts = useDashboardStore((state) => state.syncProducts);

  useEffect(() => {
    let active = true;

    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { products?: DashboardProduct[] }) => {
        if (active && Array.isArray(data.products)) {
          syncProducts(data.products);
        }
      })
      .catch((error) => console.error("[products] Could not sync products", error));

    return () => {
      active = false;
    };
  }, [syncProducts]);

  return null;
}
