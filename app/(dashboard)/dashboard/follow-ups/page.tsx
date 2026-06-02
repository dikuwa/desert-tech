"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, MessageCircle, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { mockFollowUps, getStatusBadgeClass } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function FollowUpsPage() {
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = filter === "All" ? mockFollowUps : mockFollowUps.filter(f => f.status === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Follow-ups</h1>
        <p className="text-sm text-muted-foreground mt-1">{mockFollowUps.filter(f => f.status === "Pending").length} pending follow-ups</p>
      </div>

      <div className="flex items-center gap-3">
        {["All", "Pending", "Done"].map(s => (
          <button key={s} onClick={() => { setFilter(s); setCurrentPage(1); }}
            className={cn("rounded-lg border px-4 py-2 text-xs font-semibold transition-colors",
              filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted")}>
            {s === "All" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {paginated.map(f => (
          <div key={f.id} className={cn("rounded-xl border bg-card p-4 transition-all hover:shadow-sm", f.status === "Done" && "opacity-60")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg",
                  f.type === "WhatsApp" ? "bg-whatsapp/10 text-whatsapp" :
                  f.type === "Phone" ? "bg-primary/10 text-primary" : "bg-info-soft text-info")}>
                  {f.type === "WhatsApp" ? <MessageCircle className="h-4 w-4" /> :
                   f.type === "Phone" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{f.customerName}</p>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(f.status))}>{f.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.orderNumber} · {f.type}</p>
                  <p className="text-xs text-foreground mt-1">{f.note}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    {f.assignedTo && <span>Assigned to: {f.assignedTo}</span>}
                    {f.dueAt && <span>Due: {new Date(f.dueAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              {f.status === "Pending" && (
                <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-success hover:bg-success-soft transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <CalendarClock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No follow-ups found</p>
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
