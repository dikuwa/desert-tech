"use client";

import { useState, useMemo } from "react";
import { Receipt, ChevronLeft, ChevronRight, Download, Send, Copy, CheckCircle2, Clock, FileText } from "lucide-react";
import { mockOrders, formatCents, getStatusBadgeClass } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function ReceiptsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const paidOrders = mockOrders.filter(o => o.paymentStatus === "Paid" || o.paymentStatus === "DepositPaid");

  const totalPages = Math.ceil(paidOrders.length / ITEMS_PER_PAGE);
  const paginated = paidOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Receipts</h1>
        <p className="text-sm text-muted-foreground mt-1">{paidOrders.length} orders eligible for receipts</p>
      </div>

      <div className="grid gap-4">
        {paginated.map(order => (
          <div key={order.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold font-mono text-primary">{order.orderNumber}</h3>
                    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(order.paymentStatus))}>{order.paymentStatus}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{order.customerName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{formatCents(order.subtotalCents)}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
                <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No receipts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Receipts become available once orders are paid.</p>
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
