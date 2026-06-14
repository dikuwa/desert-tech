"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Copy,
  Check,
  ExternalLink,
  Download,
  Filter,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import type { AuditEntry } from "@/lib/dashboard-data";

const ITEMS_PER_PAGE = 20;

// ─── Entity colour palette (soft, readable) ───────────────────────────────
const ENTITY_COLORS: Record<string, string> = {
  order: "bg-blue-50 text-blue-700 border-blue-200",
  quotation: "bg-purple-50 text-purple-700 border-purple-200",
  product: "bg-green-50 text-green-700 border-green-200",
  payment: "bg-amber-50 text-amber-700 border-amber-200",
  customer: "bg-teal-50 text-teal-700 border-teal-200",
  staff: "bg-rose-50 text-rose-700 border-rose-200",
  category: "bg-orange-50 text-orange-700 border-orange-200",
  promotion: "bg-pink-50 text-pink-700 border-pink-200",
  backinstock: "bg-cyan-50 text-cyan-700 border-cyan-200",
  brand: "bg-indigo-50 text-indigo-700 border-indigo-200",
  notification: "bg-slate-50 text-slate-700 border-slate-200",
  settings: "bg-gray-50 text-gray-700 border-gray-200",
  invitation: "bg-orange-50 text-orange-700 border-orange-200",
  user: "bg-violet-50 text-violet-700 border-violet-200",
  authentication: "bg-sky-50 text-sky-700 border-sky-200",
  catalog: "bg-lime-50 text-lime-700 border-lime-200",
};

// ─── Entity detail route map ──────────────────────────────────────────────
const ENTITY_ROUTES: Record<string, (id: string) => string> = {
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
  brand: () => `/dashboard/categories?tab=brands`,
  notification: () => `/dashboard/notifications`,
  invitation: () => `/dashboard/staff`,
  user: () => `/dashboard/staff`,
  authentication: () => `/dashboard/staff`,
  catalog: () => `/dashboard/products`,
};

const ENTITY_TYPES = [
  "all",
  "order",
  "quotation",
  "product",
  "payment",
  "customer",
  "staff",
  "category",
  "promotion",
  "brand",
  "backinstock",
  "notification",
  "settings",
  "invitation",
  "user",
  "authentication",
  "catalog",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Convert raw action strings into human-friendly labels.
 *  "user.hard_deleted"  → "User Hard Deleted"
 *  "order.created"      → "Order Created"
 *  "signed_in"          → "Signed In"
 */
function formatAction(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ") // underscores → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // title case
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "None";
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nestedValue]) => `${formatLabel(key)}: ${formatValue(nestedValue)}`)
      .join(", ");
  }
  return String(value);
}

function normalizeDetails(details: AuditEntry["details"]) {
  if (!details) return undefined;
  if (typeof details !== "string") return details;

  try {
    const parsed = JSON.parse(details);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { metadata: parsed as Record<string, unknown> }
      : { metadata: { details } };
  } catch {
    return { metadata: { details } };
  }
}

function Details({ details }: { details: AuditEntry["details"] }) {
  const normalized = normalizeDetails(details);
  if (!normalized) return null;

  const changedFields = Array.from(new Set([
    ...(normalized.changedFields ?? []),
    ...(Array.isArray(normalized.metadata?.changedFields)
      ? normalized.metadata.changedFields.filter((field): field is string => typeof field === "string")
      : []),
  ]));
  const metadata = Object.entries(normalized.metadata ?? {}).filter(
    ([key]) => key !== "changedFields",
  );

  if (changedFields.length === 0 && metadata.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 text-xs font-normal leading-relaxed text-muted-foreground">
      {changedFields.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="text-[11px] font-medium text-foreground/70">Changed fields:</span>
          {changedFields.map((field) => (
            <span
              key={field}
              className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground"
            >
              {formatLabel(field)}
            </span>
          ))}
        </div>
      )}
      {metadata.length > 0 && (
        <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {metadata.map(([key, value]) => (
            <div key={key} className="min-w-0 break-words [overflow-wrap:anywhere]">
              <dt className="inline text-[11px] font-medium text-foreground/70">
                {formatLabel(key)}:
              </dt>{" "}
              <dd className="inline font-normal">{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/** Shorten a long ID for display, keeping first & last chars. */
function shortenId(id: string, maxLen = 18): string {
  if (id.length <= maxLen) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

// ─── Copy button component ───────────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-2.5 w-2.5 text-green-500" />
      ) : (
        <Copy className="h-2.5 w-2.5" />
      )}
      <span className="truncate max-w-[80px]">{shortenId(text)}</span>
    </button>
  );
}

// ─── Entity link component ────────────────────────────────────────────────
function EntityLabel({ entry }: { entry: AuditEntry }) {
  const route = ENTITY_ROUTES[entry.entityType]?.(entry.entityId);

  return (
    <div className="min-w-0 space-y-1 break-words [overflow-wrap:anywhere]">
      <div className="flex min-w-0 items-start gap-1.5">
        {route ? (
          <Link
            href={route}
            className="flex min-w-0 items-start gap-1 text-xs font-medium leading-relaxed text-foreground transition-colors hover:text-primary"
            title={`View ${entry.entityType}: ${entry.entityLabel}`}
          >
            <span className="break-words [overflow-wrap:anywhere]">{entry.entityLabel}</span>
            <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <span className="break-words text-xs font-medium leading-relaxed text-foreground [overflow-wrap:anywhere]">
            {entry.entityLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <CopyButton text={entry.entityId} label="Entity ID" />
        {/* Quick link to search products by entity label if it looks like a SKU */}
        {entry.entityType === "product" && /DT-/i.test(entry.entityLabel) && (
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

// ─── Main page component ──────────────────────────────────────────────────
export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    fetch("/api/audit-logs", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load audit logs");
        return response.json();
      })
      .then((data) => {
        if (active) setAuditLogs(data.auditLogs ?? []);
      })
      .catch(() => {
        if (active) setAuditLogs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // ── Filtered & paginated data ──────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toMs = dateTo
      ? new Date(dateTo + "T23:59:59").getTime()
      : Infinity;

    return auditLogs.filter((entry) => {
      if (entityFilter !== "all" && entry.entityType !== entityFilter)
        return false;

      if (fromMs || toMs < Infinity) {
        const ts = new Date(entry.timestamp).getTime();
        if (ts < fromMs || ts > toMs) return false;
      }

      if (!q) return true;

      return (
        entry.action.toLowerCase().includes(q) ||
        entry.entityLabel.toLowerCase().includes(q) ||
        entry.performedBy.toLowerCase().includes(q) ||
        entry.entityId.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, search, entityFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // ── Export CSV ─────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = [
      "Action",
      "Entity Type",
      "Entity Label",
      "Entity ID",
      "Performed By",
      "Timestamp",
      "Details",
    ];
    const rows = filtered.map((e) => [
      e.action,
      e.entityType,
      e.entityLabel,
      e.entityId,
      e.performedBy,
      new Date(e.timestamp).toISOString(),
      typeof e.details === "string" ? e.details : e.details ? JSON.stringify(e.details) : "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showFilters = dateFrom !== "" || dateTo !== "" || entityFilter !== "all" || search !== "";

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track important actions across the store.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* ── Controls card ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        {/* Search + date filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by action, entity, ID, or staff member…"
              aria-label="Search audit logs"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-2 sm:flex">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
              title="From date"
            />
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
              title="To date"
            />
          </div>
        </div>

        {/* Entity filter chips */}
        <div className="flex gap-1.5 overflow-x-auto flex-wrap -mb-1">              {ENTITY_TYPES.map((type) => {
            const isActive = entityFilter === type;
            return (
              <button
                key={type}
                onClick={() => {
                  setEntityFilter(type);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? type === "all"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : `${ENTITY_COLORS[type]} border-current shadow-sm`
                    : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                )}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Active filter summary */}
        {showFilters && (
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Filter className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {search && ` for "${search}"`}
              {entityFilter !== "all" && ` · ${entityFilter}`}
              {(dateFrom || dateTo) && ` · date filtered`}
            </span>
          </div>
        )}
      </div>

      {/* ── Audit log list ─────────────────────────────────────────────── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center rounded-xl border border-dashed border-border bg-card">
          <History className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {loading
              ? "Loading audit entries…"
              : showFilters
              ? "No matching audit entries"
              : "No audit entries yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {showFilters
              ? "Try adjusting your search or filters."
              : "Audit entries will appear here as orders, products, and other entities are managed."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table header — hidden on small screens */}
          <div className="hidden lg:grid grid-cols-[100px_minmax(280px,1fr)_minmax(160px,220px)_minmax(130px,180px)_130px] gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Entity</span>
            <span>Action &amp; Details</span>
            <span>Entity Details</span>
            <span>Staff</span>
            <span className="text-right">Time</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-border">
            {paginated.map((entry, i) => (
              <FadeIn key={entry.id} delay={i * 0.02}>
                <div className="grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-muted/20 sm:px-5 lg:grid-cols-[100px_minmax(280px,1fr)_minmax(160px,220px)_minmax(130px,180px)_130px] lg:gap-4">
                  {/* Entity type badge */}
                  <div className="flex items-start">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize",
                        ENTITY_COLORS[entry.entityType] ||
                          "bg-gray-50 text-gray-700 border-gray-200",
                      )}
                    >
                      {entry.entityType}
                    </span>
                  </div>

                  {/* Action + details */}
                  <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {formatAction(entry.action)}
                    </p>
                    <Details details={entry.details} />
                  </div>

                  {/* Entity label + ID */}
                  <EntityLabel entry={entry} />

                  {/* Staff */}
                  <div className="flex min-w-0 items-start gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="break-words text-xs font-normal text-foreground [overflow-wrap:anywhere]">
                      {entry.performedBy}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-start gap-1.5 lg:justify-end">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0 lg:hidden" />
                    <time
                      className="text-xs text-muted-foreground whitespace-nowrap"
                      title={new Date(entry.timestamp).toLocaleString()}
                    >
                      {new Date(entry.timestamp).toLocaleString("en-NA", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    {/* Small clock icon on desktop */}
                    <Clock className="h-3 w-3 text-muted-foreground/50 shrink-0 hidden lg:inline" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <span className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "entry" : "entries"}
          </span>

          <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page numbers — efficient: only iterate visible range */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | "ellipsis")[] = [];
                for (let p = 1; p <= totalPages; p++) {
                  if (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 2
                  ) {
                    pages.push(p);
                  } else if (pages[pages.length - 1] !== "ellipsis") {
                    pages.push("ellipsis");
                  }
                }
                return pages.map((pageOrEllipsis) =>
                  pageOrEllipsis === "ellipsis" ? (
                    <span key="e" className="text-xs text-muted-foreground/40 px-0.5">
                      …
                    </span>
                  ) : (
                    <button
                      key={pageOrEllipsis}
                      onClick={() => setCurrentPage(pageOrEllipsis)}
                      className={cn(
                        "min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-colors",
                        currentPage === pageOrEllipsis
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      {pageOrEllipsis}
                    </button>
                  ),
                );
              })()}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
