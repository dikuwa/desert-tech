"use client";

import { useState } from "react";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents, getStatusBadgeClass } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const payments = useDashboardStore((s) => s.payments);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const paginated = payments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">{payments.length} payment records</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2">
          <p className="text-xs text-muted-foreground">Total Collected</p>
          <p className="text-lg font-bold text-foreground">{formatCents(payments.filter(p => p.status === "Confirmed").reduce((s, p) => s + p.amountCents, 0))}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-sm font-semibold text-primary">{p.orderNumber}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.customerName}</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">{formatCents(p.amountCents)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(p.status))}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.recordedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
