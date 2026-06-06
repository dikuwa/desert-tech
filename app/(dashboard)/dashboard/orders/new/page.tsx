"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  Save,
  User,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/dashboard-data";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LineItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
}

const PAYMENT_METHODS = ["BankTransfer", "Cash", "PhoneTransfer", "Card", "Other"] as const;
const CONTACT_METHODS = ["WhatsApp", "Phone", "Email"] as const;

export default function NewWalkinOrderPage() {
  const router = useRouter();
  const addOrder = useDashboardStore((s) => s.addOrder);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState("WhatsApp");

  const [items, setItems] = useState<LineItem[]>([
    { name: "", quantity: 1, unitPriceCents: 0 },
  ]);

  const [recordPayment, setRecordPayment] = useState(false);
  const [paymentAmountCents, setPaymentAmountCents] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("BankTransfer");
  const [paymentNote, setPaymentNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unitPriceCents: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + (item.name.trim() ? item.quantity : 0), 0);

  const canSubmit =
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 5 &&
    itemCount > 0 &&
    subtotalCents > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const newOrder = addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        preferredContact,
        itemCount,
        subtotalCents,
        payment: recordPayment && paymentAmountCents > 0
          ? {
              amountCents: paymentAmountCents,
              method: paymentMethod,
              note: paymentNote || undefined,
            }
          : undefined,
      });

      toast.success(`Order ${newOrder.orderNumber} created`);

      // Navigate to the receipt page
      router.push(`/dashboard/orders/${newOrder.id}/receipt`);
    } catch (err) {
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Orders
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        New Walk-in Order
      </h1>
      <p className="text-sm text-muted-foreground -mt-4">
        Record an in-store or WhatsApp purchase manually.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-5"
      >
        {/* Customer Details */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Customer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Phone <span className="text-destructive">*</span>
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="+264 81 234 5678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Preferred Contact
              </label>
              <Select
                value={preferredContact}
                onValueChange={setPreferredContact}
              >
                <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border shadow-lg z-[80]">
                  {CONTACT_METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="text-sm cursor-pointer focus:bg-accent">
                      {m === "WhatsApp" ? "WhatsApp" : m === "Phone" ? "Phone Call" : "Email"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-end rounded-lg bg-muted/30 p-3"
              >
                <div className="col-span-5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Item Name
                  </label>
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="e.g. MacBook Air"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="col-span-4">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Price
                  </label>
                  <MoneyInput
                    value={item.unitPriceCents}
                    onChange={(v) => updateItem(idx, "unitPriceCents", v)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="col-span-1 flex items-end pb-0.5">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCents(subtotalCents)}
            </span>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-muted-foreground">Record payment now</span>
              <input
                type="checkbox"
                checked={recordPayment}
                onChange={(e) => setRecordPayment(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </label>
          </div>

          {recordPayment && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Total: <strong className="text-foreground">{formatCents(subtotalCents)}</strong>
                {paymentAmountCents > 0 && (
                  <span className="ml-2">
                    &rarr; {paymentAmountCents >= subtotalCents ? "Paid in full" : `Deposit: ${formatCents(paymentAmountCents)}`}
                    {paymentAmountCents > 0 && paymentAmountCents < subtotalCents && (
                      <span className="text-destructive ml-1">
                        (Balance: {formatCents(subtotalCents - paymentAmountCents)})
                      </span>
                    )}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Amount
                  </label>
                  <MoneyInput
                    value={paymentAmountCents}
                    onChange={setPaymentAmountCents}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Method
                  </label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-9 text-xs rounded-lg border border-border bg-background px-3 focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m} className="text-sm cursor-pointer focus:bg-accent">
                          {m === "BankTransfer" ? "Bank Transfer" : m === "PhoneTransfer" ? "Phone Transfer" : m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Note (optional)
                  </label>
                  <input
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="e.g. Cash at store"
                    className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
          )}

          {!recordPayment && (
            <p className="text-xs text-muted-foreground">
              A receipt will still be generated showing the amount due. Payment can be recorded later from the order detail page.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create Order{recordPayment ? " & Record Payment" : ""}
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          The order will be created with a generated order number and you&apos;ll be taken to the receipt page.
        </p>
      </form>
    </div>
  );
}
