"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboard";

export function CatalogSync({ importLocal = false }: { importLocal?: boolean }) {
  const syncCategories = useDashboardStore((state) => state.syncCategories);
  const syncBrands = useDashboardStore((state) => state.syncBrands);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const state = useDashboardStore.getState();
      const shouldImport = importLocal && !window.localStorage.getItem("desert-tech-catalog-imported");
      const response = await fetch("/api/catalog", shouldImport ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: state.categories, brands: state.brands }),
      } : undefined);
      if (!response.ok) return;
      const data = await response.json();
      if (!active) return;
      syncCategories(data.categories ?? []);
      syncBrands(data.brands ?? []);
      if (shouldImport) window.localStorage.setItem("desert-tech-catalog-imported", "true");
    };
    sync().catch((error) => console.error("[catalog] Could not sync catalog", error));
    return () => { active = false; };
  }, [importLocal, syncBrands, syncCategories]);

  return null;
}
