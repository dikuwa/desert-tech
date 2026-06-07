"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { formatCents, getStatusBadgeClass, getStatusLabel } from "@/lib/dashboard-data";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function QuotationsPage() {
  const quotations = useDashboardStore((s) => s.quotations);
  const updateQuotationStatus = useDashboardStore((s) => s.updateQuotationStatus);
  const deleteQuotation = useDashboardStore((s) => s.deleteQuotation);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotations.filter((qt) => {
      if (statusFilter !== "all" && qt.status !== statusFilter) return false;
      if (q && !qt.customerName.toLowerCase().includes(q) && !qt.quotationNumber.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [quotations, search, statusFilter]);

  const statuses = ["all", "Draft", "Sent", "Accepted", "Declined"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {quotations.length} total &middot; {quotations.filter((q) => q.status === "Draft").length} drafts
          </p>
        </div>
        <Link
          href="/dashboard/quotations/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or quotation number..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {search || statusFilter !== "all" ? "No matching quotations" : "No quotations yet"}
          </p>
          {!search && statusFilter === "all" && (
            <Link
              href="/dashboard/quotations/new"
              className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Create your first quotation
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((qt, i) => (
            <FadeIn key={qt.id} delay={i * 0.03}>
            <div
              className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/dashboard/quotations/${qt.id}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {qt.customerName}
                    </Link>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", getStatusBadgeClass(qt.status))}>
                      {getStatusLabel(qt.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{qt.quotationNumber}</span>
                    <span>{qt.items.length} item{qt.items.length !== 1 ? "s" : ""}</span>
                    <span>{new Date(qt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">
                    {formatCents(qt.subtotalCents)}
                  </span>
                  <div className="flex items-center gap-1">
                    {qt.status === "Draft" && (
                      <button
                        onClick={() => {
                          updateQuotationStatus(qt.id, "Sent");
                          toast.success("Quotation marked as sent");
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        title="Mark as sent"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {qt.status === "Sent" && (
                      <>
                        <button
                          onClick={() => {
                            updateQuotationStatus(qt.id, "Accepted");
                            toast.success("Quotation accepted");
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-success hover:bg-success-soft transition-colors"
                          title="Accept"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            updateQuotationStatus(qt.id, "Declined");
                            toast.success("Quotation declined");
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                          title="Decline"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(qt.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete quotation?"
        description="This quotation will be permanently removed. This action cannot be undone."
        confirm={{
          label: "Delete Quotation",
          onClick: () => {
            if (deleteConfirm) {
              deleteQuotation(deleteConfirm);
              toast.success("Quotation deleted");
            }
            setDeleteConfirm(null);
          },
          variant: "danger",
        }}
      />
    </div>
  );
}
