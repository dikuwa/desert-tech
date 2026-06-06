"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORY_SKU_CODES: Record<string, string> = {
  "Apple": "APP",
  "Windows": "LAP",
  "Gaming": "GAME",
  "CCTV & Security": "CCTV",
  "POS Systems": "POS",
  "Accessories": "ACC",
  "Phones & Tablets": "PHT",
  "Networking": "NET",
  "Auto Services": "AUTO",
};

function generateSKU(category: string, existingProducts: { sku?: string }[]): string {
  const code = CATEGORY_SKU_CODES[category] || "GEN";
  // Find the highest sequence number for this category code
  let maxSeq = 0;
  for (const p of existingProducts) {
    if (p.sku) {
      const match = p.sku.match(new RegExp(`^DT-${code}-(\\d+)$`));
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  return `DT-${code}-${nextSeq}`;
}

export default function NewProductPage() {
  const router = useRouter();
  const addProduct = useDashboardStore((s) => s.addProduct);
  const products = useDashboardStore((s) => s.products);
  const brands = useDashboardStore((s) => s.brands);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);    const [form, setForm] = useState({
    name: "", brand: "", category: "Apple", condition: "New" as const,
    priceCents: 0, stockQuantity: 0, reorderLimit: 5,
    description: "", sku: "", skuWasManuallyEdited: false, warranty: "", isFeatured: false,
    priceWas: 0,
  });

  const updateField = (field: string, value: string | boolean | number) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate SKU when category changes and SKU hasn't been manually edited
      if (field === "category" && typeof value === "string" && !prev.skuWasManuallyEdited) {
        updated.sku = generateSKU(value, products);
      }
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          setImages(prev => [...prev, data.url]);
          successCount++;
        } else {
          failCount++;
          console.error("Upload error:", data.error || "Unknown error");
        }
      } catch (err) {
        failCount++;
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    if (e.target) e.target.value = "";
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount !== 1 ? "s" : ""} uploaded`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} upload${failCount !== 1 ? "s" : ""} failed. Check file types (JPEG, PNG, WebP, GIF, SVG) and size (max 5MB).`);
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.priceCents) return;
    // Validate SKU uniqueness
    if (form.sku && products.some(p => p.sku === form.sku)) {
      toast.error(`SKU "${form.sku}" already exists. Please use a unique SKU.`);
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    addProduct({
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      condition: form.condition,
      priceCents: form.priceCents,
      stockQuantity: form.stockQuantity || 0,
      lowStockThreshold: form.reorderLimit || 5,
      availability: form.stockQuantity > 0 ? "InStock" : "OutOfStock",
      isPublished: true,
      isFeatured: form.isFeatured,
      sku: form.sku || undefined,
      imageUrl: images[0] || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
      images: images.length > 0 ? images : undefined,
      description: form.description.trim() || undefined,
      warranty: form.warranty.trim() || undefined,
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
                  <Select value={form.brand} onValueChange={v => updateField("brand", v)}>
                    <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      {brands.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(br => (
                        <SelectItem key={br.id} value={br.name} className="text-sm cursor-pointer focus:bg-accent">{br.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category <span className="text-destructive">*</span></label>
                  <Select value={form.category} onValueChange={v => updateField("category", v)}>
                    <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      <SelectItem value="Apple" className="text-sm cursor-pointer focus:bg-accent">Apple</SelectItem>
                      <SelectItem value="Windows" className="text-sm cursor-pointer focus:bg-accent">Windows</SelectItem>
                      <SelectItem value="Gaming" className="text-sm cursor-pointer focus:bg-accent">Gaming</SelectItem>
                      <SelectItem value="CCTV & Security" className="text-sm cursor-pointer focus:bg-accent">CCTV & Security</SelectItem>
                      <SelectItem value="Networking" className="text-sm cursor-pointer focus:bg-accent">Networking</SelectItem>
                      <SelectItem value="Phones & Tablets" className="text-sm cursor-pointer focus:bg-accent">Phones & Tablets</SelectItem>
                      <SelectItem value="Accessories" className="text-sm cursor-pointer focus:bg-accent">Accessories</SelectItem>
                      <SelectItem value="POS Systems" className="text-sm cursor-pointer focus:bg-accent">POS Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Pricing & Stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">                  <div>
                  <label className="text-sm font-medium text-foreground">Price *</label>
                  <MoneyInput value={form.priceCents} onChange={v => updateField("priceCents", v)} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock Quantity</label>
                  <input value={form.stockQuantity} onChange={e => updateField("stockQuantity", parseInt(e.target.value) || 0)} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Reorder Limit</label>
                  <input value={form.reorderLimit} onChange={e => updateField("reorderLimit", e.target.value)} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Price Was</label>
                  <MoneyInput value={form.priceWas} onChange={v => updateField("priceWas", v)} className="h-11" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Condition</label>
                  <Select value={form.condition} onValueChange={v => updateField("condition", v)}>
                    <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      <SelectItem value="New" className="text-sm cursor-pointer focus:bg-accent">New</SelectItem>
                      <SelectItem value="Refurbished" className="text-sm cursor-pointer focus:bg-accent">Refurbished</SelectItem>
                      <SelectItem value="Pre-Owned" className="text-sm cursor-pointer focus:bg-accent">Pre-Owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">SKU</label>
                  <input value={form.sku} onChange={e => {
                    updateField("sku", e.target.value);
                    setForm(prev => ({ ...prev, skuWasManuallyEdited: true }));
                  }} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="DT-APP-0001" />
                  <p className="mt-1 text-[10px] text-muted-foreground">Auto-generated from category. Edit to set manually.</p>
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
              <h2 className="text-sm font-semibold text-foreground">Product Images</h2>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="product-image-upload" />
              <label htmlFor="product-image-upload" className={cn("flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer", uploading ? "border-primary/50 bg-accent/30" : "border-border hover:border-primary/50")}>
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <p className="text-xs text-primary">Uploading...</p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload images</p>
                    <p className="text-[10px] text-muted-foreground mt-1">You can select multiple images</p>
                  </>
                )}
              </label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative group h-16 w-16 rounded-lg border border-border overflow-hidden">
                      <img src={url} alt={`Product image ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-white text-[10px] font-semibold">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
