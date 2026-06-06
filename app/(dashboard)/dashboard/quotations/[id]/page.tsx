"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  MessageCircle,
  Copy,
  User,
  ShoppingBag,
  Trash2,
  Pencil,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import {
  formatCents,
  getStatusBadgeClass,
  getStatusLabel,
} from "@/lib/dashboard-data";
import { toast } from "sonner";

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotation = useDashboardStore((s) =>
    s.quotations.find((q) => q.id === params.id),
  );
  const updateQuotationStatus = useDashboardStore((s) => s.updateQuotationStatus);
  const deleteQuotation = useDashboardStore((s) => s.deleteQuotation);
  const storeSettings = useDashboardStore((s) => s.settings);

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-semibold text-foreground">Quotation not found</p>
        <Link
          href="/dashboard/quotations"
          className="mt-2 text-sm text-primary hover:text-primary/80"
        >
          Back to Quotations
        </Link>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleCopyLink = () => {
    const link = `${window.location.origin}/dashboard/quotations/${quotation.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Quotation link copied");
  };

  const handleSendWhatsApp = () => {
    const itemsList = quotation.items
      .map(
        (item) =>
          `${item.name} x${item.quantity} — ${formatCents(item.unitPriceCents * item.quantity)}`,
      )
      .join("\n");

    const msg = encodeURIComponent(
      `*Quotation ${quotation.quotationNumber} — ${storeSettings.storeName}*\n\n` +
        `Hi ${quotation.customerName},\n\n` +
        `Here is your quotation:\n\n` +
        `${itemsList}\n\n` +
        `*Total: ${formatCents(quotation.subtotalCents)}*\n\n` +
        `${quotation.notes ? `Notes: ${quotation.notes}\n\n` : ""}` +
        `Visit us: ${storeSettings.address}\n` +
        `Phone: ${storeSettings.phone}`,
    );
    window.open(`https://wa.me/send?text=${msg}`, "_blank");
  };

  const handleDelete = () => {
    if (confirm("Delete this quotation?")) {
      deleteQuotation(quotation.id);
      toast.success("Quotation deleted");
      router.push("/dashboard/quotations");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Actions bar */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/quotations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quotations
        </Link>
        <div className="flex items-center gap-2">
          {quotation.status === "Draft" && (
            <>
              <button
                onClick={() => {
                  updateQuotationStatus(quotation.id, "Sent");
                  toast.success("Quotation marked as sent");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Mark Sent
              </button>
            </>
          )}
          {quotation.status === "Sent" && (
            <>
              <button
                onClick={() => {
                  updateQuotationStatus(quotation.id, "Accepted");
                  toast.success("Quotation accepted — you can now create an order");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-success/20 px-3 py-2 text-xs font-medium text-success hover:bg-success hover:text-white transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Accept
              </button>
              <button
                onClick={() => {
                  updateQuotationStatus(quotation.id, "Declined");
                  toast.success("Quotation declined");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Decline
              </button>
            </>
          )}
          <button
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-lg border border-whatsapp/20 px-3 py-2 text-xs font-medium text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Link
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <Link
            href={`/dashboard/quotations/${quotation.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Quotation Card */}
      <div className="rounded-xl border border-border bg-card print:border-0 print:shadow-none">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div className="flex items-start gap-3">
            <img
              src="/images/receipt-icon.svg"
              alt="Desert Technology"
              className="h-10 w-auto object-contain mt-0.5"
              onError={(e) => {
                e.currentTarget.style.display = "none";
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
              QUOTATION
            </span>
            <p className="text-sm font-bold text-foreground mt-1.5 font-mono">{quotation.quotationNumber}</p>
          </div>
        </div>

        {/* Status + Date */}
        <div className="px-6 py-4 border-b border-border grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Quotation #</p>
            <p className="font-semibold text-foreground font-mono">{quotation.quotationNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Date</p>
            <p className="text-foreground">{new Date(quotation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Status</p>
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", getStatusBadgeClass(quotation.status))}>
              {getStatusLabel(quotation.status)}
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
              <p className="text-sm font-semibold text-foreground">{quotation.customerName}</p>
              <p className="text-xs text-muted-foreground">{quotation.customerPhone}</p>
              <p className="text-xs text-muted-foreground">Contact via {Array.isArray(quotation.preferredContact) ? quotation.preferredContact.join(", ") : quotation.preferredContact}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quoted Items</p>

          {/* Items table */}
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pb-1 border-b border-border">
              <span className="flex-1">Description</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-20 text-right">Unit Price</span>
              <span className="w-20 text-right">Total</span>
            </div>
            {/* Items */}
            {quotation.items.map((item, idx) => (
              <div key={idx} className="flex items-center text-sm py-1">
                <span className="flex-1 text-foreground">{item.name}</span>
                <span className="w-12 text-center text-muted-foreground">{item.quantity}</span>
                <span className="w-20 text-right text-foreground">{formatCents(item.unitPriceCents)}</span>
                <span className="w-20 text-right font-semibold text-foreground">
                  {formatCents(item.unitPriceCents * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-b border-border">
          <div className="space-y-1.5 ml-auto max-w-[240px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatCents(quotation.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-border pt-1.5 mt-1.5">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatCents(quotation.subtotalCents)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="px-6 py-4 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-[10px] text-muted-foreground">
            {storeSettings.storeName} &mdash; {storeSettings.address}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {storeSettings.email} &mdash; {storeSettings.phone}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-xl border border-border bg-card p-5 no-print">
        <p className="text-sm font-semibold text-foreground mb-3">Status Timeline</p>
        <div className="flex items-center gap-4 text-xs">
          <div className={cn(
            "flex items-center gap-1.5",
            quotation.status === "Draft" || quotation.status === "Sent" || quotation.status === "Accepted" || quotation.status === "Declined"
              ? "text-primary" : "text-muted-foreground",
          )}>
            <span className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              quotation.status === "Draft" ? "bg-primary text-primary-foreground" : "bg-muted",
            )}>1</span>
            Draft
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={cn(
            "flex items-center gap-1.5",
            quotation.status === "Sent" || quotation.status === "Accepted" || quotation.status === "Declined"
              ? "text-primary" : "text-muted-foreground",
          )}>
            <span className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              quotation.status === "Sent" ? "bg-primary text-primary-foreground" : quotation.status === "Accepted" || quotation.status === "Declined" ? "bg-muted" : "bg-muted",
            )}>2</span>
            Sent
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={cn(
            "flex items-center gap-1.5",
            quotation.status === "Accepted" ? "text-success" : quotation.status === "Declined" ? "text-destructive" : "text-muted-foreground",
          )}>
            <span className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              quotation.status === "Accepted" ? "bg-success text-white" : quotation.status === "Declined" ? "bg-destructive text-destructive-foreground" : "bg-muted",
            )}>3</span>
            {quotation.status === "Declined" ? "Declined" : "Accepted"}
          </div>
        </div>
      </div>

      {/* Convert to order CTA */}
      {quotation.status === "Accepted" && (
        <div className="rounded-xl border border-success/20 bg-success-soft/50 p-5 flex items-center justify-between no-print">
          <div>
            <p className="text-sm font-semibold text-success">Quotation Accepted</p>
            <p className="text-xs text-success/80 mt-0.5">Create an order from this quotation to proceed.</p>
          </div>
          <Link
            href={`/dashboard/orders/new?quotationId=${quotation.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-xs font-semibold text-white hover:bg-success/90 transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Create Order
          </Link>
        </div>
      )}
    </div>
  );
}
