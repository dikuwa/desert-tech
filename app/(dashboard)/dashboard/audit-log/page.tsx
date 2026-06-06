"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { History, Search, ChevronLeft, ChevronRight, Clock, User, Copy, Check, ExternalLink } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

const ENTITY_COLORS: Record<string, string> = {
  order: "bg-blue-100 text-blue-700 border-blue-200",
  quotation: "bg-purple-100 text-purple-700 border-purple-200",
  product: "bg-green-100 text-green-700 border-green-200",
  payment: "bg-amber-100 text-amber-700 border-amber-200",
  customer: "bg-teal-100 text-teal-700 border-teal-200",
  staff: "bg-rose-100 text-rose-700 border-rose-200",
  category: "bg-orange-100 text-orange-700 border-orange-200",
  promotion: "bg-pink-100 text-pink-700 border-pink-200",
  backinstock: "bg-cyan-100 text-cyan-700 border-cyan-200",
  settings: "bg-gray-100 text-gray-700 border-gray-200",
};

// Map entity types to detail pages for clickable links
const ENTITY_ROUTES: Record<string, (entityId: string) => string> = {
  order: (id) => `/dashboard/orders/${id}`,
  quotation: (id) => `/dashboard/quotations/${id}`,
  product: (id) => `/dashboard/products/${id}/edit`,
  customer: () => `/dashboard/customers`,
  payment: () => `/dashboard/payments`,
  staff: () => `/dashboard/staff`,
  category: () => `/dashboard/categories`,
  promotion: () => `/dashboard/promotions`,
  settings: () => `/dashboard/settings`,
  backinstock: () => `/dashboard/back-in-stock`,
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-2.5 w-2.5 text-green-500" />
          <span className="text-green-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-2.5 w-2.5" />
          <span className="truncate max-w-[80px]">{text}</span>
        </>
      )}
    </button>
  );
}

function EntityLabel({ entry }: { entry: { entityType: string; entityId: string; entityLabel: string } }) {
  const route = ENTITY_ROUTES[entry.entityType]?.(entry.entityId);

  return (
    <div className="md:w-52 min-w-0 space-y-0.5">
      <div className="flex items-center gap-1.5">
        {route ? (
          <Link
            href={route}
            className="text-xs font-medium text-foreground hover:text-primary truncate flex items-center gap-1 transition-colors"
            title={`View ${entry.entityType}: ${entry.entityLabel}`}
          >
            {entry.entityLabel}
            <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <span className="text-xs font-medium text-foreground truncate">{entry.entityLabel}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <CopyButton text={entry.entityId} label="Entity ID" />
        {/* Quick link to search products by this entity label if it looks like a SKU */}
        {(entry.entityType === "product" && entry.entityLabel.match(/DT-/)) && (
          <Link
            href={`/dashboard/products?sku=${encodeURIComponent(entry.entityLabel)}`}
            className="text-[10px] text-primary/70 hover:text-primary font-mono underline underline-offset-2 transition-colors"
          >
            Find in Products
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  const auditLogs = useDashboardStore((s) => s.auditLogs);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const entityTypes = ["all", "order", "quotation", "product", "payment", "customer", "staff", "category", "promotion", "backinstock", "settings"];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return auditLogs.filter((entry) => {
      if (entityFilter !== "all" && entry.entityType !== entityFilter) return false;
      if (!q) return true;
      return (
        entry.action.toLowerCase().includes(q) ||
        entry.entityLabel.toLowerCase().includes(q) ||
        entry.performedBy.toLowerCase().includes(q) ||
        entry.entityId.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, search, entityFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const onSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {auditLogs.length} total entries &middot; Click entity labels to navigate &middot; Copy IDs with the copy button
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by action, entity, ID, or staff member..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto flex-wrap">
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => { setEntityFilter(type); setCurrentPage(1); }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
                entityFilter === type
                  ? type === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : `${ENTITY_COLORS[type]} border-current`
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Audit log table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center rounded-xl border border-dashed border-border">
          <History className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">
            {search || entityFilter !== "all"
              ? "No matching audit entries"
              : "No audit entries yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search || entityFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Audit entries will appear here as you manage orders, quotations, products, and customers."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="w-20">Entity</span>
            <span className="flex-1">Action</span>
            <span className="w-52">Entity</span>
            <span className="w-32">Staff</span>
            <span className="w-28 text-right">Timestamp</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {paginated.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group"
              >
                {/* Entity type badge */}
                <div className="md:w-20">
                  <span className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                    ENTITY_COLORS[entry.entityType] || "bg-gray-100 text-gray-700 border-gray-200",
                  )}>
                    {entry.entityType}
                  </span>
                </div>

                {/* Action */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.action}</p>
                  {entry.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                  )}
                </div>

                {/* Entity label — clickable with copy */}
                <EntityLabel entry={entry} />

                {/* Staff */}
                <div className="md:w-32 flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground truncate">{entry.performedBy}</span>
                </div>

                {/* Timestamp */}
                <div className="md:w-28 text-right flex items-center justify-end gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString("en-NA", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} &middot; {filtered.length} entries
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
