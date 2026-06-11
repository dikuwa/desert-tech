"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  User,
  ShoppingBag,
  FileText,
  Search,
  Check,
  StickyNote,
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
  sku?: string;
}

const CONTACT_METHODS = ["WhatsApp", "Phone", "Email"] as const;

export default function NewQuotationPage() {
  const router = useRouter();
  const addQuotation = useDashboardStore((s) => s.addQuotation);
  const customers = useDashboardStore((s) => s.customers);
  const products = useDashboardStore((s) => s.products);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<string[]>(["WhatsApp"]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const customerSearchRef = useRef<HTMLDivElement>(null);

  const matchingCustomers = useMemo(() => {
    if (!customerName.trim()) return [];
    const q = customerName.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q),
    ).slice(0, 8);
  }, [customerName, customers]);

  const selectCustomer = useCallback((c: typeof customers[0]) => {
    setCustomerName(c.fullName);
    setCustomerPhone(c.phone);
    setPreferredContact(Array.isArray(c.preferredContact) ? c.preferredContact : [c.preferredContact || "WhatsApp"]);
    setShowCustomerSearch(false);
  }, []);

  const [items, setItems] = useState<LineItem[]>([
    { name: "", quantity: 1, unitPriceCents: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [activeProductSearch, setActiveProductSearch] = useState<number | null>(null);
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

  const selectProduct = (idx: number, name: string, unitPriceCents: number, sku?: string) => {
    setItems((currentItems) =>
      currentItems.map((item, i) =>
        i === idx ? { ...item, name, unitPriceCents, sku } : item,
      ),
    );
    setActiveProductSearch(null);
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
      const validItems = items.filter(
        (item) => item.name.trim() && item.quantity > 0 && item.unitPriceCents > 0,
      );

      const newQuotation = addQuotation({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        preferredContact: preferredContact.length > 0 ? preferredContact : ["WhatsApp"],
        items: validItems,
        subtotalCents,
        notes: notes.trim() || undefined,
      });

      toast.success(`Quotation ${newQuotation.quotationNumber} created`);
      router.push(`/dashboard/quotations/${newQuotation.id}`);
    } catch (err) {
      toast.error("Failed to create quotation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/quotations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quotations
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        New Quotation
      </h1>
      <p className="text-sm text-muted-foreground -mt-4">
        Create a price quotation for a customer. Send via WhatsApp or print.
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
            <div className="sm:col-span-2 relative" ref={customerSearchRef}>
              <label className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setShowCustomerSearch(true);
                  }}
                  onFocus={() => setShowCustomerSearch(true)}
                  onBlur={() => setTimeout(() => setShowCustomerSearch(false), 200)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Search existing customer or type new name"
                />
              </div>
              {showCustomerSearch && matchingCustomers.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  {matchingCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCustomer(c);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary text-xs font-semibold">
                        {c.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground">{c.phone} &middot; {c.preferredContact}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.orderCount} order{c.orderCount !== 1 ? "s" : ""}
                      </div>
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
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
                Preferred Contact <span className="text-[10px] text-muted-foreground">(select all that apply)</span>
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {CONTACT_METHODS.map((m) => {
                  const isSelected = preferredContact.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPreferredContact(
                          isSelected
                            ? preferredContact.filter((c) => c !== m)
                            : [...preferredContact, m],
                        );
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      {m === "WhatsApp" ? "WhatsApp" : m === "Phone" ? "Phone Call" : "Email"}
                    </button>
                  );
                })}
              </div>
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
                className="grid grid-cols-12 gap-2 items-end rounded-lg bg-muted/30 p-3 relative"
              >
                <div className="col-span-5 relative">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Item Name
                  </label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      value={item.name}
                      onChange={(e) => {
                        updateItem(idx, "name", e.target.value);
                        setActiveProductSearch(idx);
                      }}
                      onFocus={() => setActiveProductSearch(idx)}
                      onBlur={() => setTimeout(() => setActiveProductSearch(null), 200)}
                      className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="Search product or type name"
                    />
                  </div>
                  {/* Product search dropdown */}
                  {activeProductSearch === idx && (() => {
                    const q = item.name.toLowerCase();
                    const matches = products.filter(
                      (p) =>
                        p.name.toLowerCase().includes(q) ||
                        (p.sku && p.sku.toLowerCase().includes(q)),
                    ).slice(0, 6);
                    if (!q || matches.length === 0) return null;
                    return (
                      <div className="absolute left-0 right-0 top-full z-50 mt-0.5 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                        {matches.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectProduct(idx, p.name, p.priceCents, p.sku);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors border-b border-border last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-muted-foreground">
                                {p.sku && <>{p.sku} &middot; </>}
                                {p.brand}
                              </p>
                            </div>
                            <span className="font-semibold text-foreground whitespace-nowrap">{formatCents(p.priceCents)}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
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
                    Unit Price
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

        {/* Notes */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            Notes (optional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
            placeholder="Payment terms, delivery estimate, validity period, or any additional notes..."
          />
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
              Create Quotation
            </>
          )}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          The quotation will be created as a draft. You can send it via WhatsApp or print it from the quotation page.
        </p>
      </form>
    </div>
  );
}
