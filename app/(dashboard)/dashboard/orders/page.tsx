"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Plus,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStatusBadgeClass,
  getStatusLabel,
  formatCents,
  computePaymentFields,
} from "@/lib/dashboard-data";
import type { DashboardOrder } from "@/lib/dashboard-data";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";

const ITEMS_PER_PAGE = 15;

export default function OrdersPage() {
  const router = useRouter();
  const orders = useDashboardStore((s) => s.orders);
  const payments = useDashboardStore((s) => s.payments);
  const customers = useDashboardStore((s) => s.customers);
  const addCustomer = useDashboardStore((s) => s.addCustomer);
  const deleteCustomer = useDashboardStore((s) => s.deleteCustomer);

  const toggleCustomer = (order: typeof orders[0]) => {
    const existing = customers.find(
      (c) =>
        c.fullName.toLowerCase() === order.customerName.toLowerCase() &&
        c.phone === order.customerPhone,
    );
    if (existing) {
      deleteCustomer(existing.id);
      toast.success(`${existing.fullName} removed from customers`);
    } else {
      addCustomer({
        fullName: order.customerName.trim(),
        phone: order.customerPhone.trim(),
        preferredContact: Array.isArray(order.preferredContact) && order.preferredContact.length > 0 ? order.preferredContact : ["WhatsApp"],
      });
      toast.success(`${order.customerName} added to customers`);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof DashboardOrder>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState<string>("All");

  // Compute balance per order (uses paymentStatus to handle PaidInFull without payment records)
  const orderBalances = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const orderPayments = payments.filter((p) => p.orderNumber === o.orderNumber);
      const { balanceDueCents } = computePaymentFields(
        o.subtotalCents,
        o.paymentStatus,
        orderPayments,
      );
      map[o.id] = balanceDueCents;
    }
    return map;
  }, [orders, payments]);

  const filtered = useMemo(() => {
    let result = [...orders];

    // Payment status filter
    if (paymentFilter !== "All") {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt" || sortField === "updatedAt") {
        cmp =
          new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      } else if (sortField === "subtotalCents") {
        cmp = a.subtotalCents - b.subtotalCents;
      } else if (sortField === "itemCount") {
        cmp = a.itemCount - b.itemCount;
      } else {
        cmp = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [orders, searchQuery, sortField, sortDir, paymentFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by order number, customer, or phone..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="w-44">
          <Select
            value={paymentFilter}
            onValueChange={(value) => {
              setPaymentFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payments</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="DepositPaid">Deposit Paid</SelectItem>
              <SelectItem value="PaidInFull">Paid in Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <FadeIn delay={0.1}>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("orderNumber")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Order
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fulfillment
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("subtotalCents")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Total
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Due
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    <ShoppingBag className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold text-primary">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground truncate max-w-[150px]">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                          getStatusBadgeClass(order.contactStatus),
                        )}
                      >
                        {getStatusLabel(order.contactStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                          getStatusBadgeClass(order.paymentStatus),
                        )}
                      >
                        {getStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                          getStatusBadgeClass(order.fulfillmentStatus),
                        )}
                      >
                        {getStatusLabel(order.fulfillmentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground whitespace-nowrap">
                      {formatCents(order.subtotalCents)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {(() => {
                        const balance = orderBalances[order.id] ?? order.subtotalCents;
                        if (balance <= 0) return <span className="text-xs text-muted-foreground">—</span>;
                        return <span className="text-xs font-semibold text-destructive">{formatCents(balance)}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const isCustomer = customers.some(
                          (c) =>
                            c.fullName.toLowerCase() === order.customerName.toLowerCase() &&
                            c.phone === order.customerPhone,
                        );
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCustomer(order);
                            }}
                            title={isCustomer ? "Remove from customers" : "Save to customers"}
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                              isCustomer
                                ? "text-success hover:text-destructive hover:bg-destructive/5"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                            )}
                          >
                            {isCustomer ? (
                              <UserCheck className="h-3.5 w-3.5" />
                            ) : (
                              <UserX className="h-3.5 w-3.5" />
                            )}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </FadeIn>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, idx, arr) => (
                <div key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {page}
                  </button>
                </div>
              ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
