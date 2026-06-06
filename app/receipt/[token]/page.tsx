import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Phone, Download, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusBadgeClass } from "@/lib/dashboard-data";

interface PublicReceiptPageProps {
  params: Promise<{ token: string }>;
}

const WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

async function fetchDocument(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/documents/token?token=${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

import { formatCents } from "@/lib/dashboard-data";

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PaidInFull: "Paid in Full",
    DepositPaid: "Deposit Paid",
    Unpaid: "Unpaid",
    Paid: "Paid",
    Pending: "Pending",
    ReadyForCollection: "Ready for Collection",
    Completed: "Completed",
    Cancelled: "Cancelled",
  };
  return map[status] || status;
}

export default async function PublicReceiptPage({ params }: PublicReceiptPageProps) {
  const { token } = await params;
  const result = await fetchDocument(token);

  if (!result?.success) {
    notFound();
  }

  const { data } = result;
  const items = data.items || [];
  const receiptNumber = `RCP-${data.orderNumber.replace("DT-", "")}`;
  const date = new Date(data.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const totalCents = data.subtotalCents + (data.fulfillmentMethod === "courier" ? (data.courierFeeCents || 0) : 0);
  const paidCents = data.totalPaidCents || 0;
  const balanceCents = data.balanceDueCents !== undefined ? data.balanceDueCents : Math.max(0, data.subtotalCents - paidCents);
  const isPaidInFull = data.paymentStatus === "PaidInFull" || (data.paymentStatus !== "Unpaid" && balanceCents <= 0);
  const isDepositPaid = data.paymentStatus === "DepositPaid";

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/desertech-favicon.svg"
              alt="Desert Technology"
              className="h-8 w-auto"
            />
            <span className="text-sm font-bold text-foreground">Desert Technology</span>
          </Link>
          <span className="rounded-md bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-bold tracking-wider">
            RECEIPT
          </span>
        </div>

        {/* Receipt card */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">Desert Technology Consultant</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Windhoek, Namibia</p>
              <p className="text-xs text-muted-foreground">{PHONE}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground font-mono">{receiptNumber}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{data.orderNumber}</p>
            </div>
          </div>

          {/* Order info */}
          <div className="px-6 py-4 border-b border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
              <p className="font-medium text-foreground mt-0.5">{date}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
              <p className="font-medium text-foreground mt-0.5">{data.customerName}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</p>
              <a href={`tel:${data.customerPhone}`} className="font-medium text-primary hover:underline mt-0.5 block">
                {data.customerPhone}
              </a>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Items</p>
            <div className="space-y-2">
              <div className="flex items-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pb-1 border-b border-border">
                <span className="flex-1">Description</span>
                <span className="w-12 text-center">Qty</span>
                <span className="w-20 text-right">Price</span>
                <span className="w-20 text-right">Total</span>
              </div>
              {items.length > 0 ? items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center text-sm">
                  <span className="flex-1 text-foreground">{item.name}</span>
                  <span className="w-12 text-center text-muted-foreground">{item.quantity}</span>
                  <span className="w-20 text-right text-foreground">{formatCents(item.unitPriceCents)}</span>
                  <span className="w-20 text-right font-semibold text-foreground">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </span>
                </div>
              )) : (
                <div className="flex items-center text-sm">
                  <span className="flex-1 text-foreground">Order Items</span>
                  <span className="w-12 text-center text-muted-foreground">—</span>
                  <span className="w-20 text-right font-semibold text-foreground">
                    {formatCents(data.subtotalCents)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-b border-border">
            <div className="space-y-1.5 ml-auto max-w-[240px]">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatCents(data.subtotalCents)}</span>
              </div>
              {data.fulfillmentMethod === "courier" ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Courier Fee</span>
                  <span className="font-medium text-foreground">{formatCents(data.courierFeeCents || 0)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Collection</span>
                  <span className="font-medium text-success">Free</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-border pt-1.5 mt-1.5">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCents(totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Summary</p>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", getStatusBadgeClass(data.paymentStatus))}>
                {getStatusLabel(data.paymentStatus)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-success-soft/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-success mb-1">Paid</p>
                <p className="text-lg font-bold text-success">{formatCents(paidCents)}</p>
              </div>
              <div className={cn("rounded-lg p-3", isPaidInFull ? "bg-success-soft/50" : "bg-warning-soft/50")}>
                <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", isPaidInFull ? "text-success" : "text-warning")}>
                  {isPaidInFull ? "Settled" : "Balance Due"}
                </p>
                <p className={cn("text-lg font-bold", isPaidInFull ? "text-success" : "text-destructive")}>
                  {isPaidInFull ? "N$ 0" : formatCents(balanceCents)}
                </p>
              </div>
            </div>
            {isPaidInFull && (
              <div className="mt-3 rounded-lg border border-success/20 bg-success-soft/50 px-4 py-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-success">Paid in Full</p>
                  <p className="text-[11px] text-success/80 mt-0.5">No outstanding balance.</p>
                </div>
              </div>
            )}
            {isDepositPaid && balanceCents > 0 && (
              <div className="mt-3 rounded-lg border border-warning/20 bg-warning-soft/50 px-4 py-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-warning">Deposit Received</p>
                  <p className="text-[11px] text-warning/80 mt-0.5">{formatCents(balanceCents)} remaining.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <a
            href={`/api/receipts/generate?orderId=${data.orderNumber}&view=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi DesertTech, I'm enquiring about my order ${data.orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-whatsapp/20 bg-whatsapp-soft px-4 py-3 text-sm font-semibold text-whatsapp hover:bg-whatsapp hover:text-white transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${PHONE}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              <Phone className="h-4 w-4" />
              Call Us
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          Desert Technology Consultant &mdash; Windhoek, Namibia
        </p>
      </div>
    </div>
  );
}
