"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Send,
  ExternalLink,
  Search,
  MessageCircle,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents, getStatusBadgeClass, getStatusLabel } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ITEMS_PER_PAGE = 10;
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";

type DocumentTab = "receipts" | "quotations";

export default function DocumentsPage() {
  const [currentTab, setCurrentTab] = useState<DocumentTab>("receipts");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addNotification = useDashboardStore((s) => s.addNotification);
  const storeOrders = useDashboardStore((s) => s.orders);
  const quotations = useDashboardStore((s) => s.quotations);
  const updateQuotationStatus = useDashboardStore((s) => s.updateQuotationStatus);
  const deleteQuotation = useDashboardStore((s) => s.deleteQuotation);

  // Receipts from paid/deposit orders
  const allOrders = [...storeOrders];
  const paidOrders = allOrders.filter(
    (o) => o.paymentStatus === "PaidInFull" || o.paymentStatus === "DepositPaid"
  );

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    const q = search.toLowerCase();
    return paidOrders.filter((o) => {
      if (statusFilter !== "all" && o.paymentStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    });
  }, [paidOrders, search, statusFilter]);

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    const q = search.toLowerCase();
    return quotations.filter((qt) => {
      if (statusFilter !== "all" && qt.status !== statusFilter) return false;
      if (!q) return true;
      return (
        qt.customerName.toLowerCase().includes(q) ||
        qt.quotationNumber.toLowerCase().includes(q) ||
        qt.customerPhone.includes(q)
      );
    });
  }, [quotations, search, statusFilter]);

  const filtered = currentTab === "receipts" ? filteredReceipts : filteredQuotations;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Receipt filter options
  const receiptStatuses = ["all", "PaidInFull", "DepositPaid"];
  // Quotation filter options
  const quotationStatuses = ["all", "Draft", "Sent", "Accepted", "Declined"];

  const handleDownloadPDF = async (orderNumber: string) => {
    setDownloading(orderNumber);
    try {
      const res = await fetch("/api/receipts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderNumber }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(null);
    }
  };

  const handleSendViaWhatsApp = (orderNumber: string, customerName: string) => {
    const msg = encodeURIComponent(
      `Hi ${customerName}, here is your receipt for order ${orderNumber}. You can download it here: ${window.location.origin}/api/receipts/generate?orderId=${orderNumber}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleSendViaEmail = async (orderNumber: string) => {
    const order = paidOrders.find((o) => o.orderNumber === orderNumber);
    if (!order) return;
    setSending(orderNumber);
    try {
      const res = await fetch("/api/receipts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          customerEmail: order.customerName.toLowerCase().replace(/\s+/g, ".") + "@customer.com",
          customerName: order.customerName,
        }),
      });
      if (res.ok) {
        addNotification({
          type: "order",
          title: "Receipt Sent",
          message: `Receipt for ${order.orderNumber} sent via email`,
        });
      }
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(null);
      setShowSendModal(null);
    }
  };

  const handleCopyLink = (orderNumber: string) => {
    const link = `${window.location.origin}/api/receipts/generate?orderId=${orderNumber}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeleteQuotation = (id: string) => {
    deleteQuotation(id);
    setDeleteConfirm(null);
    toast.success("Quotation deleted");
  };

  // Reset page when tab/search changes
  const onSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentTab === "receipts"
              ? `${paidOrders.length} receipts available`
              : `${quotations.length} quotations · ${quotations.filter((q) => q.status === "Draft").length} drafts`}
          </p>
        </div>
        {currentTab === "quotations" && (
          <Link
            href="/dashboard/quotations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Quotation
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-border pb-px">
        <button
          onClick={() => { setCurrentTab("receipts"); setCurrentPage(1); setSearch(""); setStatusFilter("all"); }}
          className={cn(
            "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px",
            currentTab === "receipts"
              ? "border-primary text-primary bg-accent/30"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <FileText className="h-4 w-4" />
          Receipts
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {paidOrders.length}
          </span>
        </button>
        <button
          onClick={() => { setCurrentTab("quotations"); setCurrentPage(1); setSearch(""); setStatusFilter("all"); }}
          className={cn(
            "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px",
            currentTab === "quotations"
              ? "border-primary text-primary bg-accent/30"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Quotations
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {quotations.length}
          </span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              currentTab === "receipts"
                ? "Search by customer, order number, or phone..."
                : "Search by customer or quotation number..."
            }
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(currentTab === "receipts" ? receiptStatuses : quotationStatuses).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : s === "PaidInFull" ? "Paid" : s === "DepositPaid" ? "Deposit" : s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center rounded-xl border border-dashed border-border">
          {currentTab === "receipts" ? (
            <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          ) : (
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40 mb-3" />
          )}
          <p className="text-sm font-medium text-foreground">
            {search || statusFilter !== "all"
              ? "No matching documents"
              : currentTab === "receipts"
                ? "No receipts yet"
                : "No quotations yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentTab === "receipts"
              ? "Receipts become available once orders are paid."
              : "Create a quotation to send to a customer."}
          </p>
          {currentTab === "quotations" && !search && statusFilter === "all" && (
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
          {paginated.map((item: any) => {
            if (currentTab === "receipts") {
              const order = item;
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/dashboard/orders/${order.id}/receipt`}
                            className="text-sm font-semibold text-primary font-mono hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(order.paymentStatus))}>
                            {getStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5 truncate">{order.customerName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{formatCents(order.subtotalCents)}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDownloadPDF(order.orderNumber)}
                        disabled={downloading === order.orderNumber}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloading === order.orderNumber ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowSendModal(order.orderNumber)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                        title="Send"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        href={`/api/receipts/generate?orderId=${order.orderNumber}&view=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/orders/${order.id}/receipt`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        title="Open receipt"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Quotation item
              const qt = item;
              return (
                <div
                  key={qt.id}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/dashboard/quotations/${qt.id}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {qt.customerName}
                          </Link>
                          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(qt.status))}>
                            {getStatusLabel(qt.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="font-mono">{qt.quotationNumber}</span>
                          <span>{qt.items.length} item{qt.items.length !== 1 ? "s" : ""}</span>
                          <span>{new Date(qt.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
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
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <Link
                          href={`/dashboard/quotations/${qt.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          title="Open quotation"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
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
            Page {currentPage} of {totalPages}
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

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSendModal(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground mb-2">Send Receipt</h3>
            <p className="text-xs text-muted-foreground mb-5">Choose how to send the receipt to the customer.</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const order = paidOrders.find((o) => o.orderNumber === showSendModal);
                  if (order) handleSendViaWhatsApp(order.orderNumber, order.customerName);
                  setShowSendModal(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-whatsapp/30 hover:bg-whatsapp-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-whatsapp-soft text-whatsapp">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Send via WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Opens WhatsApp with receipt link</p>
                </div>
              </button>
              <button
                onClick={() => handleSendViaEmail(showSendModal)}
                disabled={sending === showSendModal}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-accent disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  {sending === showSendModal ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Send via Email</p>
                  <p className="text-xs text-muted-foreground">{sending === showSendModal ? "Sending..." : "Sends receipt via email"}</p>
                </div>
              </button>
              <button
                onClick={() => {
                  handleCopyLink(showSendModal);
                  setShowSendModal(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-border/70 hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {copiedLink ? <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <Copy className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{copiedLink ? "Copied!" : "Copy Receipt Link"}</p>
                  <p className="text-xs text-muted-foreground">Copy shareable PDF link to clipboard</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowSendModal(null)}
              className="mt-4 w-full rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Quotation Confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete quotation?"
        description="This quotation will be permanently removed. This action cannot be undone."
        confirm={{
          label: "Delete Quotation",
          onClick: () => deleteConfirm && handleDeleteQuotation(deleteConfirm),
          variant: "danger",
        }}
      />
    </div>
  );
}
