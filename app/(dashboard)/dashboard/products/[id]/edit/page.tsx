"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const products = useDashboardStore((s) => s.products);
  const updateProduct = useDashboardStore((s) => s.updateProduct);
  const product = products.find(p => p.id === params.id);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  // Initialize form when product loads
  if (product && Object.keys(form).length === 0) {
    setForm({
      name: product.name, brand: product.brand, category: product.category,
      condition: product.condition, priceCents: product.priceCents,
      stockQuantity: product.stockQuantity, reorderLimit: product.lowStockThreshold,
      priceWas: product.compareAtPriceCents || "",
      isFeatured: product.isFeatured,
    });
  }

  const updateField = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <Link href="/dashboard/products" className="mt-2 text-sm text-primary hover:text-primary/80">Back to Products</Link>
      </div>
    );
  }

  const onSubmit = async () => {
    if (!form.name) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    updateProduct(product.id, {
      name: form.name, brand: form.brand, category: form.category,
      condition: form.condition, priceCents: parseInt(form.priceCents),
      stockQuantity: parseInt(form.stockQuantity),
      lowStockThreshold: parseInt(form.reorderLimit) || 5,
      isFeatured: form.isFeatured,
      availability: parseInt(form.stockQuantity) > 0 ? "InStock" : "OutOfStock",
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
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Edit Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input value={form.name || ""} onChange={e => updateField("name", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Brand</label>
                  <input value={form.brand || ""} onChange={e => updateField("brand", e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <Select value={form.category || ""} onValueChange={v => updateField("category", v)}>
                    <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      <SelectItem value="Apple" className="text-sm cursor-pointer focus:bg-accent">Apple</SelectItem>
                      <SelectItem value="Windows" className="text-sm cursor-pointer focus:bg-accent">Windows</SelectItem>
                      <SelectItem value="Gaming" className="text-sm cursor-pointer focus:bg-accent">Gaming</SelectItem>
                      <SelectItem value="CCTV & Security" className="text-sm cursor-pointer focus:bg-accent">CCTV & Security</SelectItem>
                      <SelectItem value="Phones & Tablets" className="text-sm cursor-pointer focus:bg-accent">Phones & Tablets</SelectItem>
                      <SelectItem value="Accessories" className="text-sm cursor-pointer focus:bg-accent">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
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
