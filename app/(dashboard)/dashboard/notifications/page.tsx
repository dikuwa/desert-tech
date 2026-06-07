"use client";

import { useState, useMemo } from "react";
import { Bell, CheckCheck, Trash2, ChevronLeft, ChevronRight, ShoppingBag, Wallet, AlertTriangle, CalendarClock } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function NotificationsPage() {
  const notifications = useDashboardStore((s) => s.notifications);
  const markNotificationRead = useDashboardStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useDashboardStore((s) => s.markAllNotificationsRead);
  const deleteNotification = useDashboardStore((s) => s.deleteNotification);

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const filtered = useMemo(() =>
    filter === "all" ? notifications : notifications.filter(n => !n.isRead),
    [filter, notifications]
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order": return ShoppingBag;
      case "payment": return Wallet;
      case "stock": return AlertTriangle;
      case "followup": return CalendarClock;
      default: return Bell;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case "order": return "bg-primary/10 text-primary border-primary/20";
      case "payment": return "bg-success-soft text-success border-success/20";
      case "stock": return "bg-warning-soft text-warning border-warning/20";
      case "followup": return "bg-info-soft text-info border-info/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-primary px-2 text-[11px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map(s => (
          <button key={s} onClick={() => { setFilter(s); setCurrentPage(1); }}
            className={cn("rounded-lg border px-4 py-2 text-xs font-semibold transition-colors",
              filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted")}>
            {s === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {paginated.map((n, i) => {
          const TypeIcon = getTypeIcon(n.type);
          return (
            <FadeIn key={n.id} delay={i * 0.03}>
            <div
              className={cn(
                "rounded-xl border p-4 transition-all cursor-pointer hover:shadow-sm group",
                n.isRead
                  ? "bg-accent/40 border-primary/10"
                  : "bg-success-soft border-success/20",
              )}
              onClick={() => { if (!n.isRead) markNotificationRead(n.id); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", getTypeColors(n.type))}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {!n.isRead && <span className="h-2 w-2 animate-pulse rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">{n.type}</span>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </FadeIn>
          );
        })}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "unread" ? "You're all caught up!" : "Notifications will appear here as they come in."}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /> Previous</button>
          <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40">Next <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  );
}
