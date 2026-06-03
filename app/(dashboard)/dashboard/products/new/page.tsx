"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

export default function NewProductPage() {
  const router = useRouter();
  const addProduct = useDashboardStore((s) => s.addProduct);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", brand: "", category: "Apple", condition: "New" as const,
    priceCents: "", stockQuantity: "0", lowStockThreshold: "5",
    description: "", sku: "", warranty: "", isFeatured: false,
    compareAtPriceCents: "",
  });

  const updateField = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const onSubmit = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.priceCents) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    addProduct({
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      condition: form.condition,
      priceCents: parseInt(form.priceCents),
      stockQuantity: parseInt(form.stockQuantity) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
      availability: parseInt(form.stockQuantity) > 0 ? "InStock" : "OutOfStock",
      isPublished: true,
      isFeatured: form.isFeatured,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
    });
    setSubmitting(false);
    router.push("/dashboard/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
      </div>          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Product Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name <span className="text-destructive">*</span></label>
                  <input value={form.name} onChange={e => updateField("name", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Product name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Brand <span className="text-destructive">*</span></label>
                  <input value={form.brand} onChange={e => updateField("brand", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="e.g. Apple, Dell" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category <span className="text-destructive">*</span></label>
                  <select value={form.category} onChange={e => updateField("category", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="Apple">Apple</option>
                    <option value="Windows">Windows</option>
                    <option value="Gaming">Gaming</option>
                    <option value="CCTV & Security">CCTV & Security</option>
                    <option value="Networking">Networking</option>
                    <option value="Phones & Tablets">Phones & Tablets</option>
                    <option value="Accessories">Accessories</option>
                    <option value="POS Systems">POS Systems</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Pricing & Stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Price (cents) <span className="text-destructive">*</span></label>
                  <input value={form.priceCents} onChange={e => updateField("priceCents", e.target.value)} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="1899900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock Quantity</label>
                  <input value={form.stockQuantity} onChange={e => updateField("stockQuantity", e.target.value)} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Low Stock Threshold</label>
                  <input value={form.lowStockThreshold} onChange={e => updateField("lowStockThreshold", e.target.value)} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Compare At (cents)</label>
                  <input value={form.compareAtPriceCents || ""} onChange={e => updateField("compareAtPriceCents", e.target.value)} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="2149900" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Condition</label>
                  <select value={form.condition} onChange={e => updateField("condition", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Pre-Owned">Pre-Owned</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">SKU</label>
                  <input value={form.sku} onChange={e => updateField("sku", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="DT-001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Warranty</label>
                  <input value={form.warranty} onChange={e => updateField("warranty", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="1 Year" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-base font-semibold text-foreground">Description</h2>
              <textarea value={form.description} onChange={e => updateField("description", e.target.value)} rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Product description..." />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-foreground">Publishing</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => updateField("isFeatured", e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Featured product</span>
              </label>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Product Image</h2>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload image</p>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60">
              {submitting ? "Saving..." : <><Save className="h-4 w-4" /> Save Product</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
