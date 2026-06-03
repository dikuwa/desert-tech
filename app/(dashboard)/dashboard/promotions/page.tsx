"use client";

import { useState } from "react";
import { Megaphone, Plus, Pencil, Eye, EyeOff, X, Check, Trash2 } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

export default function DashboardPromotionsPage() {
  const promotions = useDashboardStore((s) => s.promotions);
  const addPromotion = useDashboardStore((s) => s.addPromotion);
  const updatePromotion = useDashboardStore((s) => s.updatePromotion);
  const deletePromotion = useDashboardStore((s) => s.deletePromotion);
  const togglePromotionActive = useDashboardStore((s) => s.togglePromotionActive);

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", discountLabel: "", placement: "FeaturedSection" });

  const resetForm = () => setForm({ title: "", description: "", discountLabel: "", placement: "FeaturedSection" });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addPromotion({
      title: form.title.trim(),
      description: form.description.trim(),
      discountLabel: form.discountLabel || undefined,
      placement: form.placement,
      isActive: true,
      startsAt: new Date().toISOString().split("T")[0],
      endsAt: undefined,
    });
    resetForm();
    setShowAdd(false);
  };

  const handleEdit = (id: string) => {
    if (!form.title.trim()) return;
    updatePromotion(id, {
      title: form.title.trim(),
      description: form.description.trim(),
      discountLabel: form.discountLabel || undefined,
      placement: form.placement,
    });
    resetForm();
    setEditId(null);
  };

  const startEdit = (promo: typeof promotions[0]) => {
    setEditId(promo.id);
    setForm({ title: promo.title, description: promo.description, discountLabel: promo.discountLabel || "", placement: promo.placement });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">{promotions.filter(p => p.isActive).length} active promotions</p>
        </div>
        <button onClick={() => { setShowAdd(true); resetForm(); }} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Promotion
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">New Promotion</h3>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Promotion title"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.discountLabel} onChange={e => setForm(f => ({ ...f, discountLabel: e.target.value }))} placeholder="Discount label (e.g. Save 20%)"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none">
              <option value="HomeHero">Home Hero</option>
              <option value="FeaturedSection">Featured Section</option>
              <option value="ProductBadge">Product Badge</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); resetForm(); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {promotions.map(promo => (
          <div key={promo.id} className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-sm", !promo.isActive && "opacity-60")}>
            {editId === promo.id ? (
              <div className="space-y-3">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(promo.id)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Save</button>
                  <button onClick={() => { setEditId(null); resetForm(); }} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary"><Megaphone className="h-6 w-6" /></div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {promo.discountLabel && <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{promo.discountLabel}</span>}
                      <span className="text-xs text-muted-foreground">{promo.placement}</span>
                      <span className="text-xs text-muted-foreground">{promo.productCount} products</span>
                    </div>
                    {promo.startsAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(promo.startsAt).toLocaleDateString()}{promo.endsAt ? ` - ${new Date(promo.endsAt).toLocaleDateString()}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePromotionActive(promo.id)}
                    className={cn("rounded-lg p-2 transition-colors", promo.isActive ? "text-success hover:bg-success-soft" : "text-muted-foreground hover:bg-muted")}>
                    {promo.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => startEdit(promo)} className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deletePromotion(promo.id)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
