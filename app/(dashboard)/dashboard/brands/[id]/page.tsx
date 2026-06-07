"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Tag, ExternalLink } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { toast } from "sonner";

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;

  const brand = useDashboardStore((s) => s.brands.find((b) => b.id === brandId));
  const updateBrand = useDashboardStore((s) => s.updateBrand);
  const toggleBrandActive = useDashboardStore((s) => s.toggleBrandActive);

  const [name, setName] = useState(brand?.name || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [saving, setSaving] = useState(false);

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Tag className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-semibold text-foreground">Brand not found</p>
        <Link href="/dashboard/categories" className="mt-2 text-sm text-primary hover:text-primary/80">
          Back to Categories & Brands
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      updateBrand(brandId, { name, description });
      toast.success("Brand updated");
    } catch {
      toast.error("Failed to update brand");
    } finally {
      setSaving(false);
    }
  };

  const productCount = useDashboardStore(
    (s) => s.products.filter((p) => p.brand === brand.name).length,
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/categories"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Categories & Brands
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBrandActive(brandId)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              brand.isActive
                ? "border-destructive/20 text-destructive hover:bg-destructive/5"
                : "border-success/20 text-success hover:bg-success-soft/50"
            }`}
          >
            {brand.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Brand Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="h-10 w-10 object-contain" />
            ) : (
              <Tag className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{brand.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {productCount} product{productCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Brand Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</p>
              <p className="text-sm font-mono text-foreground mt-1">{brand.slug}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mt-1 ${
                brand.isActive
                  ? "bg-success-soft text-success border-success/20"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {brand.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort Order</p>
              <p className="text-sm text-foreground mt-1">{brand.sortOrder}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Featured</p>
              <p className="text-sm text-foreground mt-1">{brand.isFeatured ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products from this brand */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Products in this Brand</h2>
        </div>
        <BrandProductList brandName={brand.name} />
      </div>
    </div>
  );
}

function BrandProductList({ brandName }: { brandName: string }) {
  const products = useDashboardStore((s) =>
    s.products.filter((p) => p.brand === brandName),
  );

  if (products.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-muted-foreground">
        No products found for this brand.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/dashboard/products/${p.id}/edit`}
          className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors group"
        >
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-border overflow-hidden flex-shrink-0">
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.category} &middot; {p.sku || "—"}</p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
