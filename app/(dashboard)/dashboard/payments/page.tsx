"use client";

import { useState, useMemo } from "react";
import { Wallet, ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents, getStatusBadgeClass } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const datePresets = [
  { label: "All Time", days: 0 },
  { label: "Today", days: 1 },
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "Last 3 Months", days: 90 },
  { label: "This Year", days: 365 },
] as const;

export default function PaymentsPage() {
  const payments = useDashboardStore((s) => s.payments);
  const [currentPage, setCurrentPage] = useState(1);
  const [datePreset, setDatePreset] = useState("All Time");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    let result = [...payments];
    
    // Date filter
    const preset = datePresets.find(p => p.label === datePreset);
    if (preset && preset.days > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - preset.days);
      result = result.filter(p => new Date(p.recordedAt) >= cutoff);
    }
    
    // Method filter
    if (methodFilter !== "All") {
      result = result.filter(p => p.method === methodFilter);
    }
    
    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(p => p.status === statusFilter);
    }
    
    return result;
  }, [payments, datePreset, methodFilter, statusFilter]);

  const methods = useMemo(() => {
    const m = new Set(payments.map(p => p.method));
    return ["All", ...Array.from(m)];
  }, [payments]);

  const orders = useDashboardStore((s) => s.orders);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalCollected = payments.filter(p => p.status === "Confirmed").reduce((s, p) => s + p.amountCents, 0);

  // Outstanding balance: sum of (subtotal - paid) for non-cancelled, non-paid orders
  const outstandingBalance = orders
    .filter((o) => o.fulfillmentStatus !== "Cancelled" && o.paymentStatus !== "PaidInFull")
    .reduce((sum, o) => {
      const totalPaid = payments
        .filter((p) => p.orderNumber === o.orderNumber)
        .reduce((s, p) => s + p.amountCents, 0);
      return sum + Math.max(0, o.subtotalCents - totalPaid);
    }, 0);

  const partialOrders = orders.filter(
    (o) => o.fulfillmentStatus !== "Cancelled" && o.paymentStatus === "DepositPaid"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} payment records</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2">
            <p className="text-[10px] text-destructive font-semibold uppercase tracking-wider">Outstanding</p>
            <p className="text-lg font-bold text-destructive">{formatCents(outstandingBalance)}</p>
            {partialOrders > 0 && <p className="text-[10px] text-destructive/70">{partialOrders} orders with deposits</p>}
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-2">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Collected</p>
            <p className="text-lg font-bold text-foreground">{formatCents(totalCollected)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <select value={datePreset} onChange={e => { setDatePreset(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-medium text-foreground border-none focus:outline-none py-1">
            {datePresets.map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
        </div>
        <select value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none">
          <option value="All">All Methods</option>
          {methods.filter(m => m !== "All").map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none">
          <option value="All">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {datePresets.slice(0, 4).map(preset => {
          const cutoff = preset.days > 0 ? new Date(Date.now() - preset.days * 86400000) : new Date(0);
          const sum = payments
            .filter(p => p.status === "Confirmed" && new Date(p.recordedAt) >= cutoff)
            .reduce((s, p) => s + p.amountCents, 0);
          return (
            <button
              key={preset.label}
              onClick={() => { setDatePreset(preset.label); setCurrentPage(1); }}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                datePreset === preset.label
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:shadow-sm"
              )}
            >
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{preset.label}</p>
              <p className="text-sm font-bold text-foreground mt-1 tabular-nums">{formatCents(sum)}</p>
            </button>
          );
        })}
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
                <td className="px-4 py-3 text-sm font-bold text-foreground tabular-nums">{formatCents(p.amountCents)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(p.status))}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{new Date(p.recordedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No payments match your filters</p>
          </div>
        )}
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
