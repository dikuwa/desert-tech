"use client";

import { useState } from "react";
import { Settings, Save, Building2, Phone, MessageCircle, Mail, MapPin, CreditCard } from "lucide-react";
import { storeSettings } from "@/lib/dashboard-data";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(storeSettings);

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your store information and preferences.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Store Details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Store Details</h2>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Store Name</label>
            <input value={form.storeName} onChange={e => updateField("storeName", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Address</label>
            <input value={form.address} onChange={e => updateField("address", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
        </div>

        {/* Contact Details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Contact Details</h2>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</label>
            <input value={form.phone} onChange={e => updateField("phone", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</label>
            <input value={form.whatsapp} onChange={e => updateField("whatsapp", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</label>
            <input value={form.email} onChange={e => updateField("email", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
        </div>

        {/* Banking Details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Banking Details</h2>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Bank Name</label>
            <input value={form.bankName} onChange={e => updateField("bankName", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Account Name</label>
            <input value={form.bankAccountName} onChange={e => updateField("bankAccountName", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Account Number</label>
              <input value={form.bankAccountNumber} onChange={e => updateField("bankAccountNumber", e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Branch Code</label>
              <input value={form.bankBranchCode} onChange={e => updateField("bankBranchCode", e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Preferences</h2>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Receipt Prefix</label>
            <input value={form.receiptPrefix} onChange={e => updateField("receiptPrefix", e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Low Stock Threshold</label>
            <input value={form.lowStockThreshold} onChange={e => updateField("lowStockThreshold", e.target.value)}
              type="number"
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Currency</label>
            <input value={form.currency} disabled
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-muted px-3 text-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-success font-semibold">Settings saved!</span>}
        <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
