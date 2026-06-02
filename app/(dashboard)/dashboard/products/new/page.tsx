"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(["New", "Refurbished", "Pre-Owned"]),
  priceCents: z.coerce.number().min(1, "Price is required"),
  compareAtPriceCents: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  warranty: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { condition: "New", stockQuantity: 0, lowStockThreshold: 5, isFeatured: false },
  });

  const onSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Product Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name <span className="text-destructive">*</span></label>
                  <input {...register("name")} className={cn("mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1", errors.name ? "border-destructive" : "border-border focus:border-primary focus:ring-primary/30")} placeholder="Product name" />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Brand <span className="text-destructive">*</span></label>
                  <input {...register("brand")} className={cn("mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1", errors.brand ? "border-destructive" : "border-border focus:border-primary focus:ring-primary/30")} placeholder="e.g. Apple, Dell" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category <span className="text-destructive">*</span></label>
                  <select {...register("category")} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="">Select category</option>
                    <option value="Apple Products">Apple Products</option>
                    <option value="Windows Laptops">Windows Laptops</option>
                    <option value="Gaming PCs">Gaming PCs</option>
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
                  <input {...register("priceCents")} type="number" className={cn("mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1", errors.priceCents ? "border-destructive" : "border-border focus:border-primary focus:ring-primary/30")} placeholder="1899900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Compare At (cents)</label>
                  <input {...register("compareAtPriceCents")} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="2149900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Stock Quantity</label>
                  <input {...register("stockQuantity")} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Low Stock Threshold</label>
                  <input {...register("lowStockThreshold")} type="number" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Condition</label>
                  <select {...register("condition")} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Pre-Owned">Pre-Owned</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">SKU</label>
                  <input {...register("sku")} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="DT-001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Warranty</label>
                  <input {...register("warranty")} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="1 Year" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-base font-semibold text-foreground">Description</h2>
              <textarea {...register("description")} rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Product description..." />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-foreground">Publishing</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
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
