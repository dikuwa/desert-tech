"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, ShoppingBag } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents, getStatusBadgeClass, getStatusLabel } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = ["All", "PendingContact", "Contacted", "AwaitingPayment", "DepositPaid", "Paid", "ReadyForCollection", "Completed", "Cancelled"];
const PAYMENT_OPTIONS = ["All", "Unpaid", "DepositPaid", "Paid", "Refunded", "Cancelled"];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const orders = useDashboardStore((s) => s.orders);

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q));
    }
    if (statusFilter !== "All") result = result.filter(o => o.status === statusFilter);
    if (paymentFilter !== "All") result = result.filter(o => o.paymentStatus === paymentFilter);
    result.sort((a, b) => {
      const valA = (a as any)[sortField];
      const valB = (b as any)[sortField];
      if (!valA || !valB) return 0;
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return result;
  }, [search, statusFilter, paymentFilter, sortField, sortDir, orders]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} orders found</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <FileText className="h-3.5 w-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search orders..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none">
          {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                { key: "orderNumber", label: "Order" },
                { key: "customerName", label: "Customer" },
                { key: "itemCount", label: "Items" },
                { key: "subtotalCents", label: "Total" },
                { key: "status", label: "Status" },
                { key: "paymentStatus", label: "Payment" },
                { key: "createdAt", label: "Date" },
              ].map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort(col.key)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && <ChevronDown className={cn("h-3 w-3", sortDir === "asc" && "rotate-180")} />}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map(order => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-sm font-semibold text-primary hover:text-primary/80">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{order.itemCount}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCents(order.subtotalCents)}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(order.status))}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(order.paymentStatus))}>
                    {getStatusLabel(order.paymentStatus)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/orders/${order.id}`}
                    className="text-xs font-semibold text-primary hover:text-primary/80">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
