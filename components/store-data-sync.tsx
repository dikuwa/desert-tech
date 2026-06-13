"use client";

import { useEffect } from "react";
import type { DashboardPromotion } from "@/lib/dashboard-data";
import type { StoreSettings } from "@/lib/store-settings";
import { useDashboardStore } from "@/lib/store/dashboard";

export function StoreDataSync() {
  const syncPromotions = useDashboardStore((state) => state.syncPromotions);
  const syncSettings = useDashboardStore((state) => state.syncSettings);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/api/settings", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/promotions", { cache: "no-store" }).then((response) => response.json()),
    ])
      .then(([settingsData, promotionsData]: [
        { settings?: StoreSettings },
        { promotions?: DashboardPromotion[] },
      ]) => {
        if (!active) return;
        if (settingsData.settings) syncSettings(settingsData.settings);
        syncPromotions(promotionsData.promotions ?? []);
      })
      .catch((error) => console.error("[store-data] Could not sync database data", error));

    return () => {
      active = false;
    };
  }, [syncPromotions, syncSettings]);

  return null;
}
