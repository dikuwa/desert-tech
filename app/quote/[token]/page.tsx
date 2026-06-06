import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Phone, FileSpreadsheet } from "lucide-react";

interface PublicQuotationPageProps {
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
    Draft: "Draft",
    Sent: "Sent",
    Accepted: "Accepted",
    Declined: "Declined",
  };
  return map[status] || status;
}

export default async function PublicQuotationPage({ params }: PublicQuotationPageProps) {
  const { token } = await params;
  const result = await fetchDocument(token);

  if (!result?.success) {
    notFound();
  }

  const { data } = result;
  const items = data.items || [];
  const date = new Date(data.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* Header */}
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
            QUOTATION
          </span>
        </div>

        {/* Quotation card */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">Desert Technology Consultant</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Windhoek, Namibia</p>
              <p className="text-xs text-muted-foreground">{PHONE}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground font-mono">{data.quotationNumber}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="px-6 py-4 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Customer</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{data.customerName}</p>
                <p className="text-xs text-muted-foreground">{data.customerPhone}</p>
              </div>
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
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center text-sm">
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

          {/* Total */}
          <div className="px-6 py-4 border-b border-border">
            <div className="space-y-1.5 ml-auto max-w-[240px]">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatCents(data.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-border pt-1.5 mt-1.5">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCents(data.subtotalCents)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="px-6 py-4 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{data.notes}</p>
            </div>
          )}

          {/* Status */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Status</p>
            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium border-info/20 bg-info-soft text-info">
              {getStatusLabel(data.status)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi DesertTech, I'd like to proceed with the quotation ${data.quotationNumber} (Total: ${formatCents(data.subtotalCents)}).`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-whatsapp/20 bg-whatsapp-soft px-6 py-3 text-sm font-semibold text-whatsapp hover:bg-whatsapp hover:text-white transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Accept via WhatsApp
          </a>
          <a
            href={`tel:${PHONE}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          Desert Technology Consultant &mdash; Windhoek, Namibia
        </p>
      </div>
    </div>
  );
}
