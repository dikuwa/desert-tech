"use client";

import { useEffect, useRef } from "react";
import { useDashboardStore } from "@/lib/store/dashboard";

/**
 * DashboardNotificationPoller
 *
 * Periodically polls /api/dashboard/notifications for new server-side
 * notifications (from storefront orders, back-in-stock requests, etc.) and
 * merges them into the Zustand dashboard store so they appear in the
 * notification list and badge counter.
 *
 * Deduplicates by server notification ID first, falling back to a composite
 * key of (type, title, message) for the initial seed check.
 */
export function DashboardNotificationPoller() {
  const addNotification = useDashboardStore((s) => s.addNotification);
  const seenServerIds = useRef<Set<string>>(new Set());
  const seenCompositeKeys = useRef<Set<string>>(new Set());

  // Seed seenKeys with notifications already in the store on mount
  useEffect(() => {
    const current = useDashboardStore.getState().notifications;
    for (const n of current) {
      seenCompositeKeys.current.add(compositeKey(n));
    }
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/dashboard/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.notifications)) return;

        for (const n of data.notifications) {
          // Skip if we've already seen this server ID
          if (n.id && seenServerIds.current.has(n.id)) continue;

          // Skip if the exact content already exists in the local store
          const key = compositeKey(n);
          if (seenCompositeKeys.current.has(key)) continue;

          if (n.id) seenServerIds.current.add(n.id);
          seenCompositeKeys.current.add(key);

          addNotification({
            type: n.type,
            title: n.title,
            message: n.message,
          });
        }
      } catch {
        // Silently ignore — the user may not be authenticated on first render
      }
    };

    // Initial poll shortly after mount (allows hydration to complete)
    const initialTimer = setTimeout(poll, 2000);

    // Poll every 15 seconds
    const interval = setInterval(poll, 15_000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [addNotification]);

  return null;
}

function compositeKey(n: { type: string; title: string; message: string }) {
  return `${n.type}||${n.title}||${n.message}`;
}
