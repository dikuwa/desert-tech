"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone, Mail, CheckCircle2, XCircle, Clock, User, Package, Wallet, CalendarClock, Receipt, Plus, Download } from "lucide-react";
import { mockOrders, mockCustomers, mockFollowUps, formatCents, getStatusBadgeClass, getStatusLabel } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";

export default function OrderDetailPage() {
  const params = useParams();
  const order = mockOrders.find(o => o.id === params.id);
  const [showAddPayment, setShowAddPayment] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Order not found</p>
        <Link href="/dashboard/orders" className="mt-2 text-sm text-primary hover:text-primary/80">Back to Orders</Link>
      </div>
    );
  }

  const customer = mockCustomers.find(c => c.fullName === order.customerName);
  const followUps = mockFollowUps.filter(f => f.orderNumber === order.orderNumber);

  const timeline = [
    { label: "Order Created", time: order.createdAt, icon: Clock, done: true },
    { label: order.status === "PendingContact" ? "Awaiting Contact" : "Customer Contacted", time: order.updatedAt, icon: User, done: order.status !== "PendingContact" },
    { label: order.paymentStatus === "Unpaid" ? "Awaiting Payment" : "Payment Received", time: order.updatedAt, icon: Wallet, done: order.paymentStatus !== "Unpaid" && order.paymentStatus !== "Cancelled" },
    { label: order.status === "Completed" ? "Completed" : "Ready for Collection", time: order.updatedAt, icon: Package, done: order.status === "Completed" || order.status === "ReadyForCollection" || order.status === "Paid" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Orders
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">{order.orderNumber}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn("inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold", getStatusBadgeClass(order.status))}>{getStatusLabel(order.status)}</span>
                  <span className={cn("inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold", getStatusBadgeClass(order.paymentStatus))}>{getStatusLabel(order.paymentStatus)}</span>
                  <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-whatsapp px-3 py-2 text-xs font-semibold text-white hover:bg-whatsapp-hover transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href={`tel:${order.customerPhone}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Order Timeline</h2>
            <div className="space-y-0">
              {timeline.map((step, idx) => (
                <div key={step.label} className="flex gap-4 pb-4 relative">
                  {idx < timeline.length - 1 && <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />}
                  <div className={cn("flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0", step.done ? "bg-success-soft text-success" : "bg-gray-100 text-gray-400")}>
                    <step.icon className="h-3 w-3" />
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(step.time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Order Items</h2>
            <div className="space-y-3">
              {[
                { name: 'MacBook Air 15" M3', qty: 1, price: 1899900 },
                { name: "Logitech MX Master 3S", qty: 1, price: 159900 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.qty} × {formatCents(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatCents(item.price * item.qty)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatCents(order.subtotalCents)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Customer</h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{order.customerName}</p>
              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
              {customer?.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
              <p className="text-xs text-muted-foreground">Contact: {order.preferredContact}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-whatsapp/10 text-whatsapp px-2.5 py-1.5 text-xs font-semibold hover:bg-whatsapp hover:text-white transition-colors">
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </a>
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                <Phone className="h-3 w-3" /> Call
              </a>
              {customer?.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                  <Mail className="h-3 w-3" /> Email
                </a>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Payments</h2>
              <button onClick={() => setShowAddPayment(!showAddPayment)} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCents(order.subtotalCents)}</p>
            <p className={cn("text-xs mt-1", order.paymentStatus === "Paid" ? "text-success" : "text-warning")}>
              {order.paymentStatus === "Paid" ? "Fully Paid" : order.paymentStatus === "DepositPaid" ? "Deposit Paid" : "Unpaid"}
            </p>
          </div>

          {/* Follow-ups */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Follow-ups</h2>
              <Link href="/dashboard/follow-ups" className="text-xs font-semibold text-primary hover:text-primary/80">View All</Link>
            </div>
            {followUps.length === 0 ? (
              <p className="text-xs text-muted-foreground">No follow-ups yet.</p>
            ) : (
              <div className="space-y-2">
                {followUps.slice(0, 3).map(f => (
                  <div key={f.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{f.type} - {f.status}</p>
                      <p className="text-[11px] text-muted-foreground">{f.note}</p>
                    </div>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(f.status))}>{f.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Receipt */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Receipt</h2>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <Receipt className="h-3.5 w-3.5" /> Generate Receipt
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors mt-2">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
