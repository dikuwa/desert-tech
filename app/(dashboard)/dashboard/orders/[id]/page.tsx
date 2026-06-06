"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  User,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import {
  getStatusBadgeClass,
  getStatusLabel,
  formatCents,
} from "@/lib/dashboard-data";
import type {
  DashboardOrder,
  OrderContactStatus,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
} from "@/lib/dashboard-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONTACT_ORDER: OrderContactStatus[] = ["NotContacted", "Contacted"];
const PAYMENT_ORDER: OrderPaymentStatus[] = ["Unpaid", "DepositPaid", "PaidInFull"];
const FULFILLMENT_ORDER: OrderFulfillmentStatus[] = ["Pending", "ReadyForCollection", "Completed"];

interface TimelineEntry {
  stage: string;
  status: string;
  label: string;
  timestamp: string;
  icon: typeof CheckCircle2;
  iconClass: string;
  active: boolean;
}

function buildTimeline(order: DashboardOrder): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      stage: "Contact",
      status: order.contactStatus,
      label: getStatusLabel(order.contactStatus),
      timestamp: order.contactStatusAt || order.createdAt,
      icon: order.contactStatus === "Contacted" ? CheckCircle2 : Clock,
      iconClass:
        order.contactStatus === "Contacted"
          ? "text-success bg-success-soft"
          : "text-muted-foreground bg-gray-100",
      active: order.contactStatus === "Contacted",
    },
    {
      stage: "Payment",
      status: order.paymentStatus,
      label: getStatusLabel(order.paymentStatus),
      timestamp: order.paymentStatusAt || order.createdAt,
      icon:
        order.paymentStatus === "PaidInFull"
          ? CheckCircle2
          : order.paymentStatus === "DepositPaid"
            ? Clock
            : XCircle,
      iconClass:
        order.paymentStatus === "PaidInFull"
          ? "text-success bg-success-soft"
          : order.paymentStatus === "DepositPaid"
            ? "text-warning bg-warning-soft"
            : "text-muted-foreground bg-gray-100",
      active: order.paymentStatus !== "Unpaid",
    },
    {
      stage: "Fulfillment",
      status: order.fulfillmentStatus,
      label: getStatusLabel(order.fulfillmentStatus),
      timestamp: order.fulfillmentStatusAt || order.createdAt,
      icon:
        order.fulfillmentStatus === "Completed"
          ? CheckCircle2
          : order.fulfillmentStatus === "Cancelled"
            ? XCircle
            : order.fulfillmentStatus === "ReadyForCollection"
              ? Clock
              : Clock,
      iconClass:
        order.fulfillmentStatus === "Completed"
          ? "text-success bg-success-soft"
          : order.fulfillmentStatus === "Cancelled"
            ? "text-destructive bg-destructive/10"
            : order.fulfillmentStatus === "ReadyForCollection"
              ? "text-info bg-info-soft"
              : "text-muted-foreground bg-gray-100",
      active:
        order.fulfillmentStatus !== "Pending" && order.fulfillmentStatus !== "Cancelled",
    },
  ];
  return entries;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const order = useDashboardStore((s) =>
    s.orders.find((o) => o.id === orderId),
  );
  const updateContactStatus = useDashboardStore(
    (s) => s.updateOrderContactStatus,
  );
  const updatePaymentStatus = useDashboardStore(
    (s) => s.updateOrderPaymentStatus,
  );
  const updateFulfillmentStatus = useDashboardStore(
    (s) => s.updateOrderFulfillmentStatus,
  );
  const resetOrderStatuses = useDashboardStore(
    (s) => s.resetOrderStatuses,
  );

  if (!order) notFound();

  const timeline = buildTimeline(order);

  // Determine which stages are enabled based on progression
  const contactDone = order.contactStatus === "Contacted";
  const paymentStarted = order.paymentStatus !== "Unpaid";
  const paymentDone = order.paymentStatus === "PaidInFull";
  const isCancelled = order.fulfillmentStatus === "Cancelled";
  const isCompleted = order.fulfillmentStatus === "Completed";

  const canChangePayment =
    contactDone && !isCancelled && !isCompleted;
  const canChangeFulfillment =
    paymentStarted && !isCancelled && !isCompleted;
  const canCancel = !isCancelled && !isCompleted;
  const canRestore = isCancelled;

  const handleContactChange = (value: string) => {
    updateContactStatus(order.id, value as OrderContactStatus);
  };

  const handlePaymentChange = (value: string) => {
    updatePaymentStatus(order.id, value as OrderPaymentStatus);
  };

  const handleFulfillmentChange = (value: string) => {
    updateFulfillmentStatus(order.id, value as OrderFulfillmentStatus);
  };

  const handleCancel = () => {
    updateFulfillmentStatus(order.id, "Cancelled");
  };

  const handleRestore = () => {
    resetOrderStatuses(order.id);
  };

  const contactMethodIcon = () => {
    switch (order.preferredContact) {
      case "WhatsApp":
        return <MessageCircle className="h-4 w-4 text-whatsapp" />;
      case "Phone":
        return <Phone className="h-4 w-4 text-blue-600" />;
      case "Email":
        return <Mail className="h-4 w-4 text-blue-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </button>
          )}
          {canRestore && (
            <button
              onClick={handleRestore}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Clock className="h-4 w-4" />
              Restore Order
            </button>
          )}
        </div>
      </div>

      {isCancelled && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <XCircle className="h-5 w-5" />
            This order has been cancelled
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer Information
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium text-foreground">
                  {order.customerName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {order.customerPhone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Preferred Contact
                </span>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {contactMethodIcon()}
                  {order.preferredContact}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Card */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Order Items ({order.itemCount} item{order.itemCount !== 1 ? "s" : ""})
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatCents(order.subtotalCents)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status Controls */}
        <div className="space-y-4">
          {/* Contact Stage */}
          <div
            className={cn(
              "rounded-xl border bg-card transition-all",
              !contactDone
                ? "border-primary/30 ring-1 ring-primary/10"
                : "border-border",
            )}
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    contactDone
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning",
                  )}
                >
                  {contactDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Step 1: Contact
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <Select
                value={order.contactStatus}
                onValueChange={handleContactChange}
                disabled={isCancelled || isCompleted}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {getStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {contactDone
                  ? "Customer has been contacted."
                  : "Reach out to the customer to discuss the order."}
              </p>
            </div>
          </div>

          {/* Payment Stage */}
          <div
            className={cn(
              "rounded-xl border bg-card transition-all",
              !contactDone
                ? "border-border opacity-50"
                : !paymentDone
                  ? "border-primary/30 ring-1 ring-primary/10"
                  : "border-border",
            )}
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    paymentDone
                      ? "bg-success-soft text-success"
                      : paymentStarted
                        ? "bg-warning-soft text-warning"
                        : "bg-gray-100 text-muted-foreground",
                  )}
                >
                  {paymentDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Step 2: Payment
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <Select
                value={order.paymentStatus}
                onValueChange={handlePaymentChange}
                disabled={!canChangePayment}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {getStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {!contactDone
                  ? "Contact the customer first to enable payment tracking."
                  : paymentDone
                    ? "Payment received in full."
                    : paymentStarted
                      ? "Deposit received — awaiting full payment."
                      : "Awaiting payment from the customer."}
              </p>
            </div>
          </div>

          {/* Fulfillment Stage */}
          <div
            className={cn(
              "rounded-xl border bg-card transition-all",
              !paymentStarted
                ? "border-border opacity-50"
                : order.fulfillmentStatus === "Completed"
                  ? "border-success/30 ring-1 ring-success/10"
                  : order.fulfillmentStatus === "Cancelled"
                    ? "border-destructive/30 ring-1 ring-destructive/10"
                    : "border-primary/30 ring-1 ring-primary/10",
            )}
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    order.fulfillmentStatus === "Completed"
                      ? "bg-success-soft text-success"
                      : order.fulfillmentStatus === "Cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : order.fulfillmentStatus === "ReadyForCollection"
                          ? "bg-info-soft text-info"
                          : "bg-gray-100 text-muted-foreground",
                  )}
                >
                  {order.fulfillmentStatus === "Completed" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : order.fulfillmentStatus === "Cancelled" ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Step 3: Fulfillment
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <Select
                value={order.fulfillmentStatus}
                onValueChange={handleFulfillmentChange}
                disabled={!canChangeFulfillment || isCancelled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending" disabled={isCompleted}>
                    Pending
                  </SelectItem>
                  <SelectItem
                    value="ReadyForCollection"
                    disabled={isCompleted}
                  >
                    Ready for Collection
                  </SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isCancelled
                  ? "This order has been cancelled."
                  : isCompleted
                    ? "Order completed successfully."
                    : !paymentStarted
                      ? "Awaiting payment to proceed with fulfillment."
                      : order.fulfillmentStatus === "ReadyForCollection"
                        ? "Items are ready for the customer to collect."
                        : "Process the order for collection or completion."}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          {!isCancelled && !isCompleted && (
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${order.customerName}, regarding your order ${order.orderNumber}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-whatsapp/20 bg-whatsapp-soft px-3 py-2.5 text-xs font-semibold text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${order.customerPhone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Order Timeline
          </h2>
        </div>
        <div className="p-5">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-6">
              {timeline.map((entry, idx) => (
                <div key={entry.stage} className="relative flex gap-4">
                  {/* Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border border-border",
                        entry.iconClass,
                      )}
                    >
                      <entry.icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {entry.stage}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          getStatusBadgeClass(entry.status),
                        )}
                      >
                        {entry.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.active
                        ? entry.stage === "Contact"
                          ? "Customer has been contacted about their order."
                          : entry.stage === "Payment"
                            ? entry.status === "PaidInFull"
                              ? "Payment has been received in full."
                              : "A deposit has been received."
                            : entry.status === "Completed"
                              ? "Order has been completed."
                              : entry.status === "ReadyForCollection"
                                ? "Items are ready for collection."
                                : "Order is pending."
                        : entry.stage === "Contact"
                          ? "Awaiting initial customer contact."
                          : entry.stage === "Payment"
                            ? "Not yet reached payment stage."
                            : "Not yet reached fulfillment stage."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
