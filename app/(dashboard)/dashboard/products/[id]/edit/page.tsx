"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { useDashboardStore } from "@/lib/store/dashboard";
import { generateProductSku, getProductAvailability, resolveLowStockThreshold } from "@/lib/product-sku";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { DesertCheckbox } from "@/components/ui/desert-checkbox";
import { cn } from "@/lib/utils";
import { SortableImageGallery } from "@/components/ui/sortable-image-gallery";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const products = useDashboardStore((s) => s.products);
  const updateProduct = useDashboardStore((s) => s.updateProduct);
  const syncProducts = useDashboardStore((s) => s.syncProducts);
  const product = products.find(p => p.id === params.id);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(() => product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : []);
  const [selectedImage, setSelectedImage] = useState(0);
  const [uploading, setUploading] = useState(false);

  const deleteImageFromStorage = async (url: string) => {
    if (!url || url.startsWith("data:") || url.startsWith("/images/")) return;
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: `images/${filename}` }),
      });
    } catch (err) {
      console.error("Failed to delete image from storage:", err);
    }
  };

  const handleImageReorder = (oldIdx: number, newIdx: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(oldIdx, 1);
    newImages.splice(newIdx, 0, moved);
    setImages(newImages);
    setSelectedImage(newIdx);
  };

  const brands = useDashboardStore((s) => s.brands);
  const categories = useDashboardStore((s) => s.categories);
  const settings = useDashboardStore((s) => s.settings);

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
      sku: product.sku || generateProductSku(product.category, products, settings.receiptPrefix),
      skuWasManuallyEdited: false,
      warranty: product.warranty || "",
      isFeatured: product.isFeatured,
      priceWas: product.compareAtPriceCents || 0,
    };
  });

  useEffect(() => {
    setForm((prev) => {
      if (!prev || prev.skuWasManuallyEdited || product?.sku) return prev;
      return { ...prev, sku: generateProductSku(prev.category, products, settings.receiptPrefix) };
    });
  }, [product?.sku, products, settings.receiptPrefix]);

  const updateField = (field: string, value: string | boolean | number) =>
    setForm(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === "category" && typeof value === "string" && !prev.skuWasManuallyEdited) {
        updated.sku = generateProductSku(
          value,
          products.filter((existing) => existing.id !== product?.id),
          settings.receiptPrefix,
        );
      }
      return updated;
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "product");
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
    const removedUrl = images[idx];
    setImages(prev => prev.filter((_, i) => i !== idx));
    setSelectedImage(prev => Math.max(0, Math.min(prev, images.length - 2)));
    if (removedUrl) deleteImageFromStorage(removedUrl);
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
    if (form.sku && products.some(p => p.id !== product.id && p.sku?.toLowerCase() === form.sku.toLowerCase())) {
      toast.error(`SKU "${form.sku}" already exists. Please use a unique SKU.`);
      return;
    }
    setSubmitting(true);
    const stockWasUnavailable = product.availability === "OutOfStock" || product.stockQuantity <= 0;
    const stockIsAvailable = form.stockQuantity > 0;
    const lowStockThreshold = resolveLowStockThreshold(form.reorderLimit, settings.lowStockThreshold);
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      condition: form.condition,
      priceCents: form.priceCents,
      stockQuantity: form.stockQuantity,
      lowStockThreshold,
      availability: getProductAvailability(form.stockQuantity, lowStockThreshold),
      isPublished: true,
      isFeatured: form.isFeatured,
      sku: form.sku || undefined,
      description: form.description || undefined,
      warranty: form.warranty || undefined,
      compareAtPriceCents: form.priceWas || undefined,
      imageUrl: images[0] || "",
      images,
    };
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.product) throw new Error(data.error || "Could not update product.");
      updateProduct(product.id, data.product);
      syncProducts(products.map((existing) => existing.id === product.id ? data.product : existing));
      toast.success("Product updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update product.");
      setSubmitting(false);
      return;
    }
    if (stockWasUnavailable && stockIsAvailable) {
      fetch("/api/back-in-stock-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: form.name.trim(),
          status: "ReadyToContact",
        }),
      }).catch(() => {});
    }
    setSubmitting(false);
    router.push("/dashboard/products");
  };

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
                      {categories.filter((category) => category.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(category => (
                        <SelectItem key={category.id} value={category.name} className="text-sm cursor-pointer focus:bg-accent">{category.name}</SelectItem>
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
                  <input value={form.sku} onChange={e => setForm(prev => prev ? {
                    ...prev,
                    sku: e.target.value,
                    skuWasManuallyEdited: true,
                  } : prev)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="DT-APP-0001" />
                  <p className="mt-1 text-[10px] text-muted-foreground">Auto-generated from category. Edit to set manually.</p>
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
              <DesertCheckbox
                checked={form.isFeatured}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
                label="Featured product"
              />
            </div>

            {/* Images */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Product Images</h2>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="edit-image-upload" />
              <label htmlFor="edit-image-upload" className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${uploading ? "border-primary/50 bg-accent/30" : "border-border hover:border-primary/50"}`}>
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
                <div className="space-y-3">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                    <ProductImage src={images[selectedImage]} alt="Selected product preview" />
                  </div>
                  <SortableImageGallery
                    images={images}
                    selectedImage={selectedImage}
                    onSelectImage={setSelectedImage}
                    onRemoveImage={removeImage}
                    onReorder={handleImageReorder}
                  />
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
