"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  ArrowUpDown,
  MessageCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp-url";
import type {
  DashboardBackInStockRequest,
  BackInStockStatus,
  BackInStockUrgency,
} from "@/lib/dashboard-data";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 15;

const statusConfig: Record<
  BackInStockStatus,
  { label: string; class: string }
> = {
  New: {
    label: "New",
    class: "bg-info-soft text-info border-info/20",
  },
  ReadyToContact: {
    label: "Ready to Contact",
    class: "bg-success-soft text-success border-success/20",
  },
  Contacted: {
    label: "Contacted",
    class: "bg-warning-soft text-warning border-warning/20",
  },
  Cancelled: {
    label: "Cancelled",
    class: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const urgencyConfig: Record<
  BackInStockUrgency,
  { label: string; icon: typeof Clock }
> = {
  ASAP: { label: "ASAP", icon: AlertTriangle },
  Flexible: { label: "Flexible", icon: Clock },
  JustChecking: { label: "Just Checking", icon: Bell },
};

export default function BackInStockPage() {
  const requests = useDashboardStore((s) => s.backInStockRequests);
  const updateStatus = useDashboardStore((s) => s.updateBackInStockStatus);
  const deleteRequest = useDashboardStore((s) => s.deleteBackInStockRequest);
  const syncRequests = useDashboardStore((s) => s.syncBackInStockRequests);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BackInStockStatus | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<BackInStockUrgency | "all">("all");
  const [sortField, setSortField] = useState<"createdAt" | "urgency" | "customerName">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...requests];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.contactValue.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== "all") {
      result = result.filter((r) => r.urgency === urgencyFilter);
    }

    // Sort
    const urgencyOrder: Record<string, number> = {
      ASAP: 0,
      Flexible: 1,
      JustChecking: 2,
    };
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "urgency") {
        cmp = (urgencyOrder[a.urgency] ?? 1) - (urgencyOrder[b.urgency] ?? 1);
      } else {
        cmp = a.customerName.localeCompare(b.customerName);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [requests, searchQuery, statusFilter, urgencyFilter, sortField, sortDir]);

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

  const getContactAction = (req: DashboardBackInStockRequest) => {
    const methods = Array.isArray(req.preferredContact) ? req.preferredContact : [req.preferredContact];
    const values = req.contactValues ?? Object.fromEntries(methods.map((method) => [method, req.contactValue]));
    return (
      <div className="flex flex-wrap gap-2">
        {methods.map((method) => {
          const contactValue = values[method] || req.contactValue;
          switch (method) {
      case "WhatsApp":
        return (
          <a
            key={method}
            href={buildWhatsAppUrl(contactValue, `Hi ${req.customerName}, regarding your request for ${req.productName} — it's now available!`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-whatsapp hover:underline"
            title="Open WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{contactValue}</span>
          </a>
        );
      case "Phone":
        return (
          <a
            key={method}
            href={`tel:${contactValue}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            title="Call"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{contactValue}</span>
          </a>
        );
      case "Email":
        return (
          <a
            key={method}
            href={`mailto:${contactValue}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            title="Send email"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{contactValue}</span>
          </a>
        );
          }
        })}
      </div>
    );
  };

  useEffect(() => {
    let active = true;
    fetch("/api/back-in-stock-requests")
      .then((response) => response.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.requests)) {
          syncRequests(data.requests);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [syncRequests]);

  const persistStatus = async (id: string, status: BackInStockStatus) => {
    updateStatus(id, status);
    try {
      const response = await fetch("/api/back-in-stock-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error();
      toast.success(status === "Contacted" ? "Customer marked as contacted" : "Request updated");
    } catch {
      toast.error("Saved locally, but the server could not be updated.");
    }
  };

  const persistDelete = async (id: string) => {
    deleteRequest(id);
    try {
      const response = await fetch("/api/back-in-stock-requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error();
      toast.success("Request deleted");
    } catch {
      toast.error("Deleted locally, but the server could not be updated.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Stock Notification Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== requests.length &&
              ` (${requests.length} total)`}
          </p>
        </div>
      </div>

      {/* Manual outreach banner */}
      {requests.some((request) => request.status === "ReadyToContact") && (
        <div className="rounded-xl border border-success/20 bg-success-soft/30 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-success" />
              Stock restored, customers are ready for follow-up
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Open each customer&apos;s preferred contact link, then mark the request as contacted.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search customer, product, or contact..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as BackInStockStatus | "all");
            setCurrentPage(1);
          }}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        >
          <option value="all">All Status</option>
          <option value="New">New</option>
          <option value="ReadyToContact">Ready to Contact</option>
          <option value="Contacted">Contacted</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => {
            setUrgencyFilter(e.target.value as BackInStockUrgency | "all");
            setCurrentPage(1);
          }}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        >
          <option value="all">All Urgency</option>
          <option value="ASAP">ASAP</option>
          <option value="Flexible">Flexible</option>
          <option value="JustChecking">Just Checking</option>
        </select>
      </div>

      {/* Table */}
      <FadeIn delay={0.1}>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("urgency")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Urgency
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Bell className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p>No stock requests found</p>
                    <p className="text-xs mt-1">
                      {requests.length === 0
                        ? "When customers request out-of-stock items, they'll appear here."
                        : "Try adjusting your filters."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((req) => {
                  const UrgencyIcon = urgencyConfig[req.urgency].icon;
                  const statusConf = statusConfig[req.status];
                  return (
                    <tr
                      key={req.id}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        req.status === "New" && "bg-info-soft/10",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {req.productName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {req.customerName}
                        </div>
                        {req.note && (
                          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {req.note}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium">
                          <UrgencyIcon className="h-3 w-3 text-muted-foreground" />
                          {urgencyConfig[req.urgency].label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {getContactAction(req)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            statusConf.class,
                          )}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {req.status === "New" && (
                            <button
                              onClick={() => persistStatus(req.id, "ReadyToContact")}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                              title="Mark ready to contact"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-success" />
                              <span className="hidden sm:inline">Ready</span>
                            </button>
                          )}
                          {req.status === "ReadyToContact" && (
                            <button
                              onClick={() => persistStatus(req.id, "Contacted")}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                              title="Mark contacted"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-warning" />
                              <span className="hidden sm:inline">Contacted</span>
                            </button>
                          )}
                          {(req.status === "New" || req.status === "ReadyToContact" || req.status === "Contacted") && (
                            <button
                              onClick={() => persistStatus(req.id, "Cancelled")}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Cancel</span>
                            </button>
                          )}
                          {req.status === "Cancelled" && (
                            <button
                              onClick={() => persistDelete(req.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
                              title="Delete"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
