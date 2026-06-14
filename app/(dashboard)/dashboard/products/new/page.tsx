"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImagePlus, Loader2, Tag, DollarSign, FileText, Upload, Star } from "lucide-react";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { useDashboardStore } from "@/lib/store/dashboard";
import { generateProductSku, getProductAvailability, resolveLowStockThreshold } from "@/lib/product-sku";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import { DesertCheckbox } from "@/components/ui/desert-checkbox";
import { toast } from "sonner";
import { SortableImageGallery } from "@/components/ui/sortable-image-gallery";

// Section card component for consistent styling
function SectionCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {children}
    </div>
  );
}

// Section header with icon
function SectionHeader({ 
  icon: Icon, 
  title 
}: { 
  icon: React.ElementType; 
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

// Form field label
function FieldLabel({ 
  children, 
  required 
}: { 
  children: React.ReactNode; 
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

// Text input with consistent styling
function TextInput({ 
  className, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm",
        "placeholder:text-muted-foreground/60",
        "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}

// Textarea with consistent styling
function TextArea({ 
  className, 
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm",
        "placeholder:text-muted-foreground/60",
        "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20",
        "transition-colors resize-none",
        className
      )}
      {...props}
    />
  );
}

// Select wrapper with consistent spacing
function FormSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  children 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 w-full rounded-lg border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-card border-border shadow-lg z-[80]">
        {children}
      </SelectContent>
    </Select>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const syncProducts = useDashboardStore((s) => s.syncProducts);
  const products = useDashboardStore((s) => s.products);
  const brands = useDashboardStore((s) => s.brands);
  const categories = useDashboardStore((s) => s.categories);
  const settings = useDashboardStore((s) => s.settings);
  
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleImageReorder = (oldIdx: number, newIdx: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(oldIdx, 1);
    newImages.splice(newIdx, 0, moved);
    setImages(newImages);
    setSelectedImage(newIdx);
  };

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
  
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    condition: "New" as const,
    priceCents: 0,
    stockQuantity: 1,
    reorderLimit: settings.lowStockThreshold,
    description: "",
    sku: generateProductSku("General", products, settings.receiptPrefix),
    skuWasManuallyEdited: false,
    warranty: "6 Months",
    isFeatured: false,
    priceWas: 0,
  });

  useEffect(() => {
    setForm((prev) => prev.skuWasManuallyEdited
      ? prev
      : { ...prev, sku: generateProductSku(prev.category || "General", products, settings.receiptPrefix) });
  }, [products, settings.receiptPrefix]);

  const updateField = (field: string, value: string | boolean | number) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate SKU when category changes and SKU hasn't been manually edited
      if (field === "category" && typeof value === "string" && !prev.skuWasManuallyEdited) {
        updated.sku = generateProductSku(value || "General", products, settings.receiptPrefix);
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

  const onSubmit = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.priceCents) return;
    
    // Validate SKU uniqueness
    if (form.sku && products.some(p => p.sku?.toLowerCase() === form.sku.toLowerCase())) {
      toast.error(`SKU "${form.sku}" already exists. Please use a unique SKU.`);
      return;
    }
    
    setSubmitting(true);
    
    const lowStockThreshold = resolveLowStockThreshold(form.reorderLimit, settings.lowStockThreshold);
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      condition: form.condition,
      priceCents: form.priceCents,
      stockQuantity: form.stockQuantity || 0,
      lowStockThreshold,
      availability: getProductAvailability(form.stockQuantity, lowStockThreshold),
      isPublished: true,
      isFeatured: form.isFeatured,
      sku: form.sku || undefined,
      imageUrl: images[0] || "",
      images: images.length > 0 ? images : undefined,
      description: form.description.trim() || undefined,
      warranty: form.warranty.trim() || undefined,
      compareAtPriceCents: form.priceWas || undefined,
    };
    
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.product) throw new Error(data.error || "Could not save product.");
      syncProducts([data.product, ...products.filter((product) => product.id !== data.product.id)]);
      toast.success("Product saved and published");
      router.push("/dashboard/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/products" 
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-8 space-y-5">
            {/* Product Information */}
            <SectionCard className="p-5">
              <SectionHeader icon={Tag} title="Product Information" />
              
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  <TextInput
                    value={form.name}
                    onChange={e => updateField("name", e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                
                {/* Brand & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Brand</FieldLabel>
                    <FormSelect
                      value={form.brand}
                      onValueChange={v => updateField("brand", v)}
                      placeholder="Select a brand"
                    >
                      {brands.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(br => (
                        <SelectItem key={br.id} value={br.name} className="text-sm cursor-pointer focus:bg-accent">
                          {br.name}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <FormSelect
                      value={form.category}
                      onValueChange={v => updateField("category", v)}
                      placeholder="Select a category"
                    >
                      {categories.filter((category) => category.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map((category) => (
                        <SelectItem key={category.id} value={category.name} className="text-sm cursor-pointer focus:bg-accent">
                          {category.name}
                        </SelectItem>
                      ))}
                    </FormSelect>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Pricing & Stock */}
            <SectionCard className="p-5">
              <SectionHeader icon={DollarSign} title="Pricing & Stock" />
              
              <div className="space-y-4">
                {/* First Row: Price, Stock, Reorder, Price Was */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <FieldLabel required>Price</FieldLabel>
                    <MoneyInput 
                      value={form.priceCents} 
                      onChange={v => updateField("priceCents", v)} 
                      className="h-10"
                    />
                  </div>
                  <div>
                    <FieldLabel>Stock Quantity</FieldLabel>
                    <TextInput
                      type="number"
                      min={0}
                      value={form.stockQuantity}
                      onChange={e => updateField("stockQuantity", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Reorder Limit</FieldLabel>
                    <TextInput
                      type="number"
                      min={0}
                      value={form.reorderLimit}
                      onChange={e => updateField("reorderLimit", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Price Was</FieldLabel>
                    <MoneyInput 
                      value={form.priceWas} 
                      onChange={v => updateField("priceWas", v)} 
                      className="h-10"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Second Row: Condition, SKU, Warranty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel>Condition</FieldLabel>
                    <FormSelect
                      value={form.condition}
                      onValueChange={v => updateField("condition", v)}
                      placeholder="Condition"
                    >
                      <SelectItem value="New" className="text-sm cursor-pointer focus:bg-accent">New</SelectItem>
                      <SelectItem value="Refurbished" className="text-sm cursor-pointer focus:bg-accent">Refurbished</SelectItem>
                      <SelectItem value="Pre-Owned" className="text-sm cursor-pointer focus:bg-accent">Pre-Owned</SelectItem>
                    </FormSelect>
                  </div>
                  <div>
                    <FieldLabel>SKU</FieldLabel>
                    <TextInput
                      value={form.sku}
                      onChange={e => {
                        updateField("sku", e.target.value);
                        setForm(prev => ({ ...prev, skuWasManuallyEdited: true }));
                      }}
                      placeholder="DT-APP-0001"
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      Auto-generated from category. Edit to set manually.
                    </p>
                  </div>
                  <div>
                    <FieldLabel>Warranty</FieldLabel>
                    <TextInput
                      value={form.warranty}
                      onChange={e => updateField("warranty", e.target.value)}
                      placeholder="6 Months"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Description */}
            <SectionCard className="p-5">
              <SectionHeader icon={FileText} title="Description" />
              <TextArea
                value={form.description}
                onChange={e => updateField("description", e.target.value)}
                rows={5}
                placeholder="Product description..."
              />
            </SectionCard>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-4 space-y-5">
            {/* Publishing */}
            <SectionCard className="p-5">
              <SectionHeader icon={Star} title="Publishing" />
              
              <DesertCheckbox
                checked={form.isFeatured}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
                label={
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">
                      Featured product
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Display this product on the featured section.
                    </p>
                  </div>
                }
                wrapperClassName="items-start"
              />
            </SectionCard>

            {/* Product Images */}
            <SectionCard className="p-5">
              <SectionHeader icon={Upload} title="Product Images" />
              
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload} 
                className="hidden" 
                id="product-image-upload" 
              />
              
              <label 
                htmlFor="product-image-upload" 
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed",
                  "p-6 text-center transition-all cursor-pointer",
                  uploading 
                    ? "border-primary/40 bg-accent/30" 
                    : "border-border hover:border-primary/40 hover:bg-accent/20"
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <p className="text-xs font-medium text-primary">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-3">
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-0.5">
                      Upload product images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-2">
                      You can select multiple images.
                    </p>
                  </>
                )}
              </label>
              
              <p className="mt-3 text-[10px] text-center text-muted-foreground/70">
                Supported formats: JPG, PNG, WEBP (Max 10MB each)
              </p>
              
              {images.length > 0 && (
                <div className="mt-4 space-y-3 pt-4 border-t border-border">
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
            </SectionCard>

            {/* Save Button */}
            <button 
              type="submit" 
              disabled={submitting}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl",
                "bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]",
                "transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
