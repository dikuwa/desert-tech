"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/lib/dashboard-data";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const product = mockProducts.find(p => p.id === params.id);
  const [submitting, setSubmitting] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <Link href="/dashboard/products" className="mt-2 text-sm text-primary hover:text-primary/80">Back to Products</Link>
      </div>
    );
  }

  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      brand: product.brand,
      category: product.category,
      condition: product.condition as "New" | "Refurbished" | "Pre-Owned",
      priceCents: product.priceCents,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      description: "",
      sku: "",
      isFeatured: product.isFeatured,
    },
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
              <h2 className="text-base font-semibold text-foreground">Edit Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input {...register("name")} className={cn("mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1", errors.name ? "border-destructive" : "border-border focus:border-primary focus:ring-primary/30")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Brand</label>
                  <input {...register("brand")} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select {...register("category")} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="Apple">Apple</option>
                    <option value="Windows">Windows</option>
                    <option value="Gaming">Gaming</option>
                    <option value="CCTV & Security">CCTV & Security</option>
                    <option value="Phones & Tablets">Phones & Tablets</option>
                    <option value="Accessories">Accessories</option>
                  </select>
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
