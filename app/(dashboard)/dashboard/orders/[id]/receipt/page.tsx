"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Banknote,
  User,
  Package,
  Calendar,
  FileText,
  MessageCircle,
  Copy,
  Mail,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import {
  formatCents,
  getStatusBadgeClass,
  getStatusLabel,
} from "@/lib/dashboard-data";
import { toast } from "sonner";

export default function OrderReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const order = useDashboardStore((s) => s.orders.find((o) => o.id === orderId));
  const payments = useDashboardStore((s) => s.payments);
  const addNotification = useDashboardStore((s) => s.addNotification);
  const storeSettings = useDashboardStore((s) => s.settings);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-semibold text-foreground">Order not found</p>
        <Link href="/dashboard/orders" className="mt-2 text-sm text-primary hover:text-primary/80">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderPayments = payments.filter((p) => p.orderNumber === order.orderNumber);
  const totalPaidCents = orderPayments.reduce((sum, p) => sum + p.amountCents, 0);
  const balanceCents = order.subtotalCents - totalPaidCents;
  const isPaidInFull = balanceCents <= 0 && order.paymentStatus !== "Unpaid";
  const isDepositPaid = order.paymentStatus === "DepositPaid";

  const receiptNumber = `RCP-${order.orderNumber.replace("DT-", "")}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch("/api/receipts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Receipt PDF downloaded");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/api/receipts/generate?orderId=${order.orderNumber}`;
    navigator.clipboard.writeText(link);
    toast.success("Receipt link copied");
  };

  const handleSendWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi ${order.customerName}, here is your receipt for ${order.orderNumber}. Total: ${formatCents(order.subtotalCents)}. ${isDepositPaid ? `Paid: ${formatCents(totalPaidCents)}, Balance due: ${formatCents(balanceCents)}.` : isPaidInFull ? "Paid in full." : ""}`,
    );
    window.open(`https://wa.me/send?text=${msg}`, "_blank");
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Receipt for ${order.orderNumber} - ${storeSettings.storeName}`);
    const paymentLine = isDepositPaid
      ? `Paid: ${formatCents(totalPaidCents)}, Balance due: ${formatCents(balanceCents)}`
      : isPaidInFull
        ? "Paid in full."
        : `Payment status: ${getStatusLabel(order.paymentStatus)}`;
    const body = encodeURIComponent(
      `Hi ${order.customerName},\n\nPlease find your receipt for ${order.orderNumber}.\n\nTotal: ${formatCents(order.subtotalCents)}\n${paymentLine}\n\nThank you for your business!\n${storeSettings.storeName}\n${storeSettings.email}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Actions bar */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Order Details
        </Link>
        <div className="flex items-center gap-1.5">
          {/* Send method: only show customer's preferred, or all if none selected */}
          {(!order.preferredContact || order.preferredContact.length === 0 || order.preferredContact.includes("WhatsApp")) && (
            <button
              onClick={handleSendWhatsApp}
              title="Send via WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-whatsapp/20 text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
          {(!order.preferredContact || order.preferredContact.length === 0 || order.preferredContact.includes("Email")) && (
            <button
              onClick={handleSendEmail}
              title="Send via Email"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-accent transition-colors"
            >
              <Mail className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleCopyLink}
            title="Copy link"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownloadPDF}
            title="Download PDF"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handlePrint}
            title="Print"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          @page { margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Receipt Card */}
      <div className="rounded-xl border border-border bg-card print:border-0 print:shadow-none">
        {/* Header with Logo */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div className="flex items-start gap-3">
            <img
              src="/images/receipt-icon.svg"
              alt="Desert Technology"
              className="h-10 w-auto object-contain mt-0.5"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
              }}
            />
            <div>
              <h2 className="text-base font-bold text-foreground">Desert Technology Consultant</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Windhoek, Namibia</p>
              <p className="text-xs text-muted-foreground">+264 85 277 5140</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground tracking-wider">
              RECEIPT
            </span>
            <p className="text-sm font-bold text-foreground mt-1.5 font-mono">{receiptNumber}</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="px-6 py-4 border-b border-border grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Order #</p>
            <p className="font-semibold text-foreground font-mono">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Date</p>
            <p className="text-foreground">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Status</p>
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", getStatusBadgeClass(order.fulfillmentStatus))}>
              {getStatusLabel(order.fulfillmentStatus)}
            </span>
          </div>
        </div>

        {/* Customer */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Customer</p>
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
              <p className="text-xs text-muted-foreground">Contact via {Array.isArray(order.preferredContact) ? order.preferredContact.join(", ") : order.preferredContact}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Items</p>
          <div className="space-y-2">
            {/* Header row */}
            <div className="flex items-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pb-1 border-b border-border">
              <span className="flex-1">Description</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-20 text-right">Price</span>
              <span className="w-20 text-right">Total</span>
            </div>
            {/* Item rows */}
            <div className="flex items-center text-sm">
              <span className="flex-1 text-foreground">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
              <span className="w-12 text-center text-muted-foreground">{order.itemCount}</span>
              <span className="w-20 text-right text-foreground">{formatCents(order.subtotalCents / order.itemCount)}</span>
              <span className="w-20 text-right font-semibold text-foreground">{formatCents(order.subtotalCents)}</span>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-b border-border">
          <div className="space-y-1.5 ml-auto max-w-[240px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatCents(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collection</span>
              <span className="font-medium text-success">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-border pt-1.5 mt-1.5">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatCents(order.subtotalCents)}</span>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Summary</p>

          {/* Payment status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", getStatusBadgeClass(order.paymentStatus))}>
              {getStatusLabel(order.paymentStatus)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-success-soft/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-success mb-1">Paid</p>
              <p className="text-lg font-bold text-success">{formatCents(totalPaidCents)}</p>
              <p className="text-[10px] text-success/70 mt-0.5">{orderPayments.length} record{orderPayments.length !== 1 ? "s" : ""}</p>
            </div>
            <div className={cn("rounded-lg p-3", isPaidInFull ? "bg-success-soft/50" : "bg-warning-soft/50")}>
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", isPaidInFull ? "text-success" : "text-warning")}>
                {isPaidInFull ? "Settled" : "Balance Due"}
              </p>
              <p className={cn("text-lg font-bold", isPaidInFull ? "text-success" : "text-destructive")}>
                {isPaidInFull ? "—" : formatCents(balanceCents)}
              </p>
            </div>
          </div>

          {/* Payment records */}
          {orderPayments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Records</p>
              <div className="space-y-1.5">
                {orderPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{p.method}</span>
                      {p.note && <span className="text-muted-foreground/60">— {p.note}</span>}
                    </div>
                    <span className="font-semibold text-foreground">{formatCents(p.amountCents)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deposit notification */}
          {isDepositPaid && balanceCents > 0 && (
            <div className="mt-4 rounded-lg border border-warning/20 bg-warning-soft/50 px-4 py-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-warning">Deposit Received</p>
                <p className="text-[11px] text-warning/80 mt-0.5">
                  {formatCents(totalPaidCents)} received. <strong>{formatCents(balanceCents)}</strong> remaining. Awaiting final payment to complete the order.
                </p>
              </div>
            </div>
          )}

          {/* Paid in full confirmation */}
          {isPaidInFull && (
            <div className="mt-4 rounded-lg border border-success/20 bg-success-soft/50 px-4 py-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-success">Paid in Full</p>
                <p className="text-[11px] text-success/80 mt-0.5">
                  {formatCents(totalPaidCents)} received. No outstanding balance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-muted-foreground print:hidden">
        <p>Desert Technology Consultant &mdash; Windhoek, Namibia</p>
        <p className="mt-0.5">{storeSettings.email} &mdash; +264 85 277 5140</p>
      </div>
    </div>
  );
}
