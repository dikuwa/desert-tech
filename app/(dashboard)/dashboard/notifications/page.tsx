"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { mockNotifications } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = filter === "all" ? notifications : notifications.filter(n => !n.isRead);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "unread"] as const).map(s => (
          <button key={s} onClick={() => { setFilter(s); setCurrentPage(1); }}
            className={cn("rounded-lg border px-4 py-2 text-xs font-semibold transition-colors",
              filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted")}>
            {s === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {paginated.map(n => (
          <div key={n.id} className={cn("rounded-xl border bg-card p-4 transition-all cursor-pointer hover:shadow-sm", !n.isRead && "border-primary/20 bg-accent/30")}
            onClick={() => toggleRead(n.id)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg",
                  n.type === "order" ? "bg-primary/10 text-primary" :
                  n.type === "payment" ? "bg-success-soft text-success" :
                  n.type === "stock" ? "bg-warning-soft text-warning" :
                  "bg-info-soft text-info")}>
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}
                className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No notifications</p>
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
