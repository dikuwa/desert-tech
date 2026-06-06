"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { useDashboardStore } from "@/lib/store/dashboard";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const products = useDashboardStore((s) => s.products);
  const updateProduct = useDashboardStore((s) => s.updateProduct);
  const product = products.find(p => p.id === params.id);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState(() => {
    if (!product) return null;
    return {
      name: product.name,
      brand: product.brand,
      category: product.category,
      condition: product.condition,
      priceCents: product.priceCents,
      stockQuantity: product.stockQuantity,
      reorderLimit: product.lowStockThreshold,
      description: product.description || "",
      sku: product.sku || "",
      warranty: product.warranty || "",
      isFeatured: product.isFeatured,
      priceWas: product.compareAtPriceCents || 0,
    };
  });

  const updateField = (field: string, value: any) =>
    setForm(prev => prev ? { ...prev, [field]: value } : prev);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImages(prev => [...prev, data.url]);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    if (e.target) e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  if (!product || !form) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <Link href="/dashboard/products" className="mt-2 text-sm text-primary hover:text-primary/80">Back to Products</Link>
      </div>
    );
  }

  const onSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    updateProduct(product.id, {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      condition: form.condition,
      priceCents: form.priceCents,
      stockQuantity: form.stockQuantity,
      lowStockThreshold: form.reorderLimit || 5,
      availability: form.stockQuantity > 0 ? "InStock" : "OutOfStock",
      isPublished: true,
      isFeatured: form.isFeatured,
      sku: form.sku || undefined,
      description: form.description || undefined,
      warranty: form.warranty || undefined,
      compareAtPriceCents: form.priceWas || undefined,
      imageUrl: images[0] || product.imageUrl,
    });
    setSubmitting(false);
    router.push("/dashboard/products");
  };

  const existingImages = product.imageUrl ? [product.imageUrl, ...(product.images || [])] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Product Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name <span className="text-destructive">*</span></label>
                  <input value={form.name} onChange={e => updateField("name", e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Product name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Brand <span className="text-destructive">*</span></label>
                  <input value={form.brand} onChange={e => updateField("brand", e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="e.g. Apple, Dell" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category <span className="text-destructive">*</span></label>
                  <Select value={form.category} onValueChange={v => updateField("category", v)}>
                    <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      {["Apple", "Windows", "Gaming", "CCTV & Security", "Networking", "Phones & Tablets", "Accessories", "POS Systems"].map(cat => (
                        <SelectItem key={cat} value={cat} className="text-sm cursor-pointer focus:bg-accent">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Pricing &amp; Stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Price *</label>
                  <MoneyInput value={form.priceCents} onChange={v => updateField("priceCents", v)} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock Quantity</label>
                  <input value={form.stockQuantity} onChange={e => updateField("stockQuantity", parseInt(e.target.value) || 0)} type="number"
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Reorder Limit</label>
                  <input value={form.reorderLimit} onChange={e => updateField("reorderLimit", parseInt(e.target.value) || 0)} type="number"
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
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
                  <input value={form.sku} onChange={e => updateField("sku", e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="DT-001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Warranty</label>
                  <input value={form.warranty} onChange={e => updateField("warranty", e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="1 Year" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-base font-semibold text-foreground">Description</h2>
              <textarea value={form.description} onChange={e => updateField("description", e.target.value)}
                rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Product description..." />
            </div>
          </div>

          <div className="space-y-6">
            {/* Publishing */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-foreground">Publishing</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => updateField("isFeatured", e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Featured product</span>
              </label>
            </div>

            {/* Images */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Product Images</h2>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="edit-image-upload" />
              <label htmlFor="edit-image-upload" className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload images</p>
                <p className="text-[10px] text-muted-foreground mt-1">You can select multiple images</p>
              </label>
              {(existingImages.length > 0 || images.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group h-16 w-16 rounded-lg border border-border overflow-hidden">
                      <img src={url} alt={`Product image ${idx + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {images.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative group h-16 w-16 rounded-lg border border-border overflow-hidden">
                      <img src={url} alt={`New image ${idx + 1}`} className="h-full w-full object-cover" />
                      <button onClick={() => removeImage(idx)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[10px] font-semibold">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save */}
            <button type="submit" disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60">
              {submitting ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
