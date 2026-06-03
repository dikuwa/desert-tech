"use client";

import { useState, useRef } from "react";
import {
  Settings,
  Save,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  CreditCard,
  ImageIcon,
  Heading,
  FileText,
  Plus,
  X,
  Check,
  Trash2,
  Upload,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Banknote,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import type { BankDetail, ContactDetail, PaymentMethod } from "@/lib/dashboard-data";

export default function SettingsPage() {
  const settings = useDashboardStore((s) => s.settings);
  const contactDetails = useDashboardStore((s) => s.contactDetails);
  const bankDetails = useDashboardStore((s) => s.bankDetails);
  const paymentMethods = useDashboardStore((s) => s.paymentMethods);
  const updateSettings = useDashboardStore((s) => s.updateSettings);
  const addContactDetail = useDashboardStore((s) => s.addContactDetail);
  const updateContactDetail = useDashboardStore((s) => s.updateContactDetail);
  const deleteContactDetail = useDashboardStore((s) => s.deleteContactDetail);
  const addBankDetail = useDashboardStore((s) => s.addBankDetail);
  const updateBankDetail = useDashboardStore((s) => s.updateBankDetail);
  const deleteBankDetail = useDashboardStore((s) => s.deleteBankDetail);
  const addPaymentMethod = useDashboardStore((s) => s.addPaymentMethod);
  const updatePaymentMethod = useDashboardStore((s) => s.updatePaymentMethod);
  const deletePaymentMethod = useDashboardStore((s) => s.deletePaymentMethod);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);
  const [activeTab, setActiveTab] = useState<"store" | "hero" | "contact" | "banking" | "payment-methods">("store");
  const [uploading, setUploading] = useState(false);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  // Contact detail form
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ type: "phone" as ContactDetail["type"], label: "", value: "", isActive: true });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Bank detail form
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", accountName: "", accountNumber: "", branchCode: "", isActive: true });
  const [editingBankId, setEditingBankId] = useState<string | null>(null);

  // Payment method form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ name: "", type: "BankTransfer" as PaymentMethod["type"], details: "", instructions: "", isActive: true });
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, heroImageUrl: data.url }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (heroImageInputRef.current) heroImageInputRef.current.value = "";
    }
  };

  const resetContactForm = () =>
    setContactForm({ type: "phone", label: "", value: "", isActive: true });

  const handleAddContact = () => {
    if (!contactForm.label.trim() || !contactForm.value.trim()) return;
    if (editingContactId) {
      updateContactDetail(editingContactId, contactForm);
      setEditingContactId(null);
    } else {
      addContactDetail(contactForm);
    }
    resetContactForm();
    setShowContactForm(false);
  };

  const startEditContact = (cd: ContactDetail) => {
    setContactForm({ type: cd.type, label: cd.label, value: cd.value, isActive: cd.isActive });
    setEditingContactId(cd.id);
    setShowContactForm(true);
  };

  const resetBankForm = () =>
    setBankForm({ bankName: "", accountName: "", accountNumber: "", branchCode: "", isActive: true });

  const handleAddBank = () => {
    if (!bankForm.bankName.trim() || !bankForm.accountName.trim() || !bankForm.accountNumber.trim()) return;
    if (editingBankId) {
      updateBankDetail(editingBankId, bankForm);
      setEditingBankId(null);
    } else {
      addBankDetail(bankForm);
    }
    resetBankForm();
    setShowBankForm(false);
  };

  const startEditBank = (bd: BankDetail) => {
    setBankForm({ bankName: bd.bankName, accountName: bd.accountName, accountNumber: bd.accountNumber, branchCode: bd.branchCode, isActive: bd.isActive });
    setEditingBankId(bd.id);
    setShowBankForm(true);
  };

  const resetPaymentForm = () =>
    setPaymentForm({ name: "", type: "BankTransfer", details: "", instructions: "", isActive: true });

  const handleAddPayment = () => {
    if (!paymentForm.name.trim() || !paymentForm.details.trim()) return;
    if (editingPaymentId) {
      updatePaymentMethod(editingPaymentId, paymentForm);
      setEditingPaymentId(null);
    } else {
      addPaymentMethod(paymentForm);
    }
    resetPaymentForm();
    setShowPaymentForm(false);
  };

  const startEditPayment = (pm: PaymentMethod) => {
    setPaymentForm({ name: pm.name, type: pm.type, details: pm.details, instructions: pm.instructions || "", isActive: pm.isActive });
    setEditingPaymentId(pm.id);
    setShowPaymentForm(true);
  };

  const tabs = [
    { id: "store" as const, label: "Store", icon: Building2 },
    { id: "hero" as const, label: "Hero", icon: ImageIcon },
    { id: "contact" as const, label: "Contact", icon: Phone },
    { id: "banking" as const, label: "Banking", icon: CreditCard },
    { id: "payment-methods" as const, label: "Payments", icon: Banknote },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage store info, hero section, contacts, and payment methods.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6">
        {/* === STORE TAB === */}
        {activeTab === "store" && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Store Information</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Store Name</label>
                <input
                  value={form.storeName}
                  onChange={(e) => updateField("storeName", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Receipt Prefix</label>
                <input
                  value={form.receiptPrefix}
                  onChange={(e) => updateField("receiptPrefix", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Low Stock Threshold</label>
                <input
                  value={form.lowStockThreshold}
                  onChange={(e) => updateField("lowStockThreshold", e.target.value)}
                  type="number"
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Currency</label>
                <input value={form.currency} disabled className="mt-1.5 h-11 w-full rounded-lg border border-border bg-muted px-3 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* === HERO TAB === */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Hero Section</h2>
              </div>

              {/* Hero Image */}
              <div>
                <label className="text-sm font-medium text-foreground">Hero Background Image</label>
                <div className="mt-2 flex items-start gap-4">
                  <div className="relative h-32 w-56 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {form.heroImageUrl ? (
                      <img
                        src={form.heroImageUrl}
                        alt="Hero"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => heroImageInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Image
                    </button>
                    <p className="text-[10px] text-muted-foreground">
                      Recommended: 1200×800px, max 5MB
                    </p>
                    {form.heroImageUrl && !form.heroImageUrl.startsWith("/images/") && (
                      <button
                        onClick={() => setForm((prev) => ({ ...prev, heroImageUrl: "/images/DTC-BG.webp" }))}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hero URL input (for external URLs) */}
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Image URL
                </label>
                <input
                  value={form.heroImageUrl}
                  onChange={(e) => updateField("heroImageUrl", e.target.value)}
                  placeholder="/images/hero.jpg or https://..."
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Hero Heading */}
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Heading className="h-3.5 w-3.5" /> Heading Text
                </label>
                <textarea
                  value={form.heroHeading}
                  onChange={(e) => updateField("heroHeading", e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Main headline for the hero section"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  HTML entities like &amp;rsquo; will be rendered. Max ~80 characters recommended.
                </p>
              </div>

              {/* Hero Subheading */}
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Subheading / Description
                </label>
                <textarea
                  value={form.heroSubheading}
                  onChange={(e) => updateField("heroSubheading", e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Subheading text below the main headline"
                />
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-2 inline-flex rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                    Desert Technology Consultant, Namibia
                  </div>
                  <h3
                    className="text-lg font-semibold leading-tight text-foreground"
                    dangerouslySetInnerHTML={{ __html: form.heroHeading }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{form.heroSubheading}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === CONTACT TAB === */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Contact Details</h2>
                </div>
                <button
                  onClick={() => {
                    setShowContactForm(true);
                    setEditingContactId(null);
                    resetContactForm();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Contact
                </button>
              </div>

              {/* Contact Details List */}
              <div className="space-y-3">
                {contactDetails.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Phone className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium text-foreground">No contact details yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add phone numbers, WhatsApp, email, or addresses to display on your storefront.
                    </p>
                  </div>
                )}

                {contactDetails.map((cd) => {
                  const typeIcon = cd.type === "phone" ? Phone : cd.type === "whatsapp" ? MessageCircle : cd.type === "email" ? Mail : MapPin;
                  const Icon = typeIcon;
                  return (
                    <div
                      key={cd.id}
                      className={cn(
                        "rounded-lg border bg-card p-4 transition-all hover:shadow-sm",
                        cd.isActive ? "border-border" : "border-dashed border-border opacity-60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">{cd.label}</h3>
                              <span className="rounded-md border border-border/50 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                                {cd.type === "whatsapp" ? "WhatsApp" : cd.type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{cd.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateContactDetail(cd.id, { isActive: !cd.isActive })
                            }
                            className={cn(
                              "rounded-lg p-1.5 transition-colors",
                              cd.isActive ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {cd.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => startEditContact(cd)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteContactDetail(cd.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add / Edit Contact Detail Form */}
              {(showContactForm || editingContactId) && (
                <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {editingContactId ? "Edit Contact Detail" : "New Contact Detail"}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-foreground">Type</label>
                      <select
                        value={contactForm.type}
                        onChange={(e) =>
                          setContactForm((f) => ({ ...f, type: e.target.value as ContactDetail["type"] }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="phone">Phone</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="address">Address / Location</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Label</label>
                      <input
                        value={contactForm.label}
                        onChange={(e) => setContactForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Main, Support, Sales, Physical"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Value</label>
                    <input
                      value={contactForm.value}
                      onChange={(e) => setContactForm((f) => ({ ...f, value: e.target.value }))}
                      placeholder={contactForm.type === "phone" ? "+264 85 277 5140" : contactForm.type === "whatsapp" ? "264852775140" : contactForm.type === "email" ? "info@example.com" : "Windhoek, Namibia"}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none"
                    />
                    {contactForm.type === "whatsapp" && (
                      <p className="mt-1 text-[10px] text-muted-foreground">Without + prefix. Used for WhatsApp links.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddContact}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      {editingContactId ? "Save Changes" : "Add Contact"}
                    </button>
                    <button
                      onClick={() => {
                        setShowContactForm(false);
                        setEditingContactId(null);
                        resetContactForm();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === BANKING TAB === */}
        {activeTab === "banking" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Banking Details</h2>
                </div>
                <button
                  onClick={() => {
                    setShowBankForm(true);
                    setEditingBankId(null);
                    resetBankForm();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Bank
                </button>
              </div>

              {/* Bank Details List */}
              <div className="space-y-3">
                {bankDetails.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium text-foreground">No bank details yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add your business bank accounts for customers to make payments.
                    </p>
                  </div>
                )}

                {bankDetails.map((bd) => (
                  <div
                    key={bd.id}
                    className={cn(
                      "rounded-lg border bg-card p-4 transition-all hover:shadow-sm",
                      bd.isActive ? "border-border" : "border-dashed border-border opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{bd.bankName}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {bd.accountName} &middot; {bd.accountNumber}
                          </p>
                          {bd.branchCode && (
                            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                              Branch Code: {bd.branchCode}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateBankDetail(bd.id, { isActive: !bd.isActive })
                          }
                          className={cn(
                            "rounded-lg p-1.5 transition-colors",
                            bd.isActive ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {bd.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => startEditBank(bd)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBankDetail(bd.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit Bank Detail Form */}
              {(showBankForm || editingBankId) && (
                <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {editingBankId ? "Edit Bank Details" : "New Bank Account"}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-foreground">Bank Name</label>
                      <input
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                        placeholder="e.g. Standard Bank, FirstBank"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Account Name</label>
                      <input
                        value={bankForm.accountName}
                        onChange={(e) => setBankForm((f) => ({ ...f, accountName: e.target.value }))}
                        placeholder="e.g. Desert TECHNOLOGIES"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-foreground">Account Number</label>
                      <input
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))}
                        placeholder="e.g. 60003162833"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Branch Code</label>
                      <input
                        value={bankForm.branchCode}
                        onChange={(e) => setBankForm((f) => ({ ...f, branchCode: e.target.value }))}
                        placeholder="e.g. 082672"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddBank}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      {editingBankId ? "Save Changes" : "Add Bank"}
                    </button>
                    <button
                      onClick={() => {
                        setShowBankForm(false);
                        setEditingBankId(null);
                        resetBankForm();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PAYMENT METHODS TAB === */}
        {activeTab === "payment-methods" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Payment Methods</h2>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentForm(true);
                    setEditingPaymentId(null);
                    resetPaymentForm();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Method
                </button>
              </div>

              {/* Payment Method List */}
              <div className="space-y-3">
                {paymentMethods.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Banknote className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium text-foreground">No payment methods yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add payment methods your customers can use.
                    </p>
                  </div>
                )}

                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={cn(
                      "rounded-lg border bg-card p-4 transition-all hover:shadow-sm",
                      pm.isActive ? "border-border" : "border-dashed border-border opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                          {pm.type === "BankTransfer" ? (
                            <CreditCard className="h-5 w-5" />
                          ) : pm.type === "Cash" ? (
                            <Banknote className="h-5 w-5" />
                          ) : pm.type === "PhoneTransfer" ? (
                            <Phone className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{pm.name}</h3>
                            <span className="rounded-md border border-border/50 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {pm.type === "BankTransfer" ? "Bank Transfer" : pm.type === "Cash" ? "Cash" : pm.type === "PhoneTransfer" ? "Mobile" : pm.type === "Card" ? "Card" : "Other"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{pm.details}</p>
                          {pm.instructions && (
                            <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">{pm.instructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updatePaymentMethod(pm.id, { isActive: !pm.isActive })
                          }
                          className={cn(
                            "rounded-lg p-1.5 transition-colors",
                            pm.isActive ? "text-success hover:bg-success-soft" : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {pm.isActive ? <Eye className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => startEditPayment(pm)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deletePaymentMethod(pm.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit Payment Method Form */}
              {(showPaymentForm || editingPaymentId) && (
                <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {editingPaymentId ? "Edit Payment Method" : "New Payment Method"}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-foreground">Name</label>
                      <input
                        value={paymentForm.name}
                        onChange={(e) => setPaymentForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Bank Transfer, Cash, E-Wallet"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Type</label>
                      <select
                        value={paymentForm.type}
                        onChange={(e) =>
                          setPaymentForm((f) => ({ ...f, type: e.target.value as PaymentMethod["type"] }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="BankTransfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="PhoneTransfer">Phone Transfer / Mobile Money</option>
                        <option value="Card">Card Payment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Details</label>
                    <input
                      value={paymentForm.details}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, details: e.target.value }))}
                      placeholder="e.g. Standard Bank, Cash at Store, etc."
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Instructions (optional)</label>
                    <input
                      value={paymentForm.instructions}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, instructions: e.target.value }))}
                      placeholder="e.g. Use your order number as reference"
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPayment}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      {editingPaymentId ? "Save Changes" : "Add Method"}
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentForm(false);
                        setEditingPaymentId(null);
                        resetPaymentForm();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success font-semibold">
            <Check className="h-4 w-4" />
            Settings saved!
          </span>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
