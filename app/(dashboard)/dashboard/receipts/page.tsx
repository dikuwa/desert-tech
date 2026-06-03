"use client";

import { useState, useMemo } from "react";
import { FileText, ChevronLeft, ChevronRight, Download, Send, ExternalLink, CheckCircle2, Clock, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { mockOrders, formatCents, getStatusBadgeClass } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store/dashboard";

const ITEMS_PER_PAGE = 10;

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";

export default function ReceiptsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const addNotification = useDashboardStore((s) => s.addNotification);
  const storeOrders = useDashboardStore((s) => s.orders);
  const allOrders = [...storeOrders, ...mockOrders.filter(mo => !storeOrders.find(so => so.orderNumber === mo.orderNumber))];
  const paidOrders = allOrders.filter(o => o.paymentStatus === "Paid" || o.paymentStatus === "DepositPaid");

  const handleDownloadPDF = async (orderId: string) => {
    setDownloading(orderId);
    try {
      const res = await fetch("/api/receipts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${orderId}.pdf`;
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

  const handleSendViaEmail = async (orderId: string) => {
    const order = paidOrders.find(o => o.id === orderId);
    if (!order) return;
    setSending(orderId);
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
                  <FileText className="h-6 w-6" />
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
                <button
                  onClick={() => handleDownloadPDF(order.id)}
                  disabled={downloading === order.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {downloading === order.id ? (
                    <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground border-t-transparent" /> Generating...</>
                  ) : (
                    <><Download className="h-3.5 w-3.5" /> PDF</>
                  )}
                </button>
                <button
                  onClick={() => setShowSendModal(order.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
                <a
                  href={`/api/receipts/generate?orderId=${order.orderNumber}&view=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No receipts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Receipts become available once orders are paid.</p>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSendModal(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground mb-2">Send Receipt</h3>
            <p className="text-xs text-muted-foreground mb-5">Choose how to send the receipt to the customer.</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const order = paidOrders.find(o => o.id === showSendModal);
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
                onClick={() => {
                  if (showSendModal) handleSendViaEmail(showSendModal);
                }}
                disabled={sending === showSendModal}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-accent disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  {sending === showSendModal ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Mail className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Send via Email</p>
                  <p className="text-xs text-muted-foreground">{sending === showSendModal ? "Sending..." : "Sends receipt via Resend email"}</p>
                </div>
              </button>
              <button
                onClick={() => {
                  const order = paidOrders.find(o => o.id === showSendModal);
                  if (order) handleCopyLink(order.orderNumber);
                  setShowSendModal(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-border/70 hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {copiedLink ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
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
