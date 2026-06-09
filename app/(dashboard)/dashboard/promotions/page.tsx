"use client";

import { useState, useRef } from "react";import {
  Megaphone,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  X,
  Check,
  Trash2,
  ImageIcon,
  Upload,
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DesertCheckbox } from "@/components/ui/desert-checkbox";

export default function DashboardPromotionsPage() {
  const promotions = useDashboardStore((s) => s.promotions);
  const addPromotion = useDashboardStore((s) => s.addPromotion);
  const updatePromotion = useDashboardStore((s) => s.updatePromotion);
  const deletePromotion = useDashboardStore((s) => s.deletePromotion);
  const togglePromotionActive = useDashboardStore((s) => s.togglePromotionActive);

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", images: [] as string[], discountLabel: "", placement: "FeaturedSection", type: "general" as string, isFeatured: true });
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => { setForm({ title: "", description: "", imageUrl: "", images: [], discountLabel: "", placement: "FeaturedSection", type: "general", isFeatured: true }); setSelectedImage(0); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMultiple = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context", "promotion");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }
      if (uploadedUrls.length > 0) {
        setForm((f) => {
          const currentImages = f.images || [];
          const newImages = isMultiple ? [...currentImages, ...uploadedUrls] : uploadedUrls;
          return { ...f, images: newImages, imageUrl: newImages[0] || "" };
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addPromotion({
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl || undefined,
      images: form.images.length > 0 ? form.images : undefined,
      discountLabel: form.discountLabel || undefined,
      placement: form.placement,
      type: form.type as any,
      isFeatured: form.isFeatured,
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
      imageUrl: form.imageUrl || undefined,
      images: form.images.length > 0 ? form.images : undefined,
      discountLabel: form.discountLabel || undefined,
      placement: form.placement,
      type: form.type as any,
      isFeatured: form.isFeatured,
    });
    resetForm();
    setEditId(null);
  };

  const startEdit = (promo: typeof promotions[0]) => {
    setEditId(promo.id);
    const promoImages = promo.images || (promo.imageUrl ? [promo.imageUrl] : []);
    setForm({
      title: promo.title,
      description: promo.description,
      imageUrl: promo.imageUrl || "",
      images: promoImages,
      discountLabel: promo.discountLabel || "",
      placement: promo.placement,
      type: promo.type || "general",
      isFeatured: promo.isFeatured !== false,
    });
    setSelectedImage(0);
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
          
          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Images</label>
              <span className="text-xs text-muted-foreground">{form.images.length} image{form.images.length !== 1 ? "s" : ""}</span>
            </div>
            
            {/* Image Gallery */}
            {form.images.length > 0 && (
              <div className="space-y-2">
                {/* Main Image Preview */}
                <div className="aspect-video w-full max-w-md rounded-lg border border-border bg-muted overflow-hidden">
                  <img 
                    src={form.images[selectedImage]} 
                    alt={`Preview ${selectedImage + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                
                {/* Thumbnail Grid */}
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className={cn(
                      "relative w-16 h-16 rounded-lg border overflow-hidden cursor-pointer transition-all",
                      selectedImage === idx 
                        ? "border-primary ring-1 ring-primary" 
                        : "border-border hover:border-primary/50"
                    )}>
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => setSelectedImage(idx)}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newImages = form.images.filter((_, i) => i !== idx);
                          setForm(f => ({ ...f, images: newImages, imageUrl: newImages[0] || "" }));
                          if (selectedImage >= newImages.length) setSelectedImage(Math.max(0, newImages.length - 1));
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <input ref={addImageInputRef} type="file" accept="image/*" multiple onChange={e => handleImageUpload(e, true)} className="hidden" />
            <button
              onClick={() => addImageInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50 transition-all w-full justify-center"
            >
              <Upload className={cn("h-4 w-4", uploading && "animate-spin")} />
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
            <p className="text-xs text-muted-foreground">Click to browse or drag and drop. You can upload multiple images.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={form.discountLabel} onChange={e => setForm(f => ({ ...f, discountLabel: e.target.value }))} placeholder="Discount label (e.g. Save 20%)"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            <Select value={form.placement} onValueChange={v => setForm(f => ({ ...f, placement: v }))}>
              <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                <SelectValue placeholder="Placement" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border shadow-lg z-[80]">
                <SelectItem value="HomeHero" className="text-sm cursor-pointer focus:bg-accent">Home Hero</SelectItem>
                <SelectItem value="FeaturedSection" className="text-sm cursor-pointer focus:bg-accent">Featured Section</SelectItem>
                <SelectItem value="ProductBadge" className="text-sm cursor-pointer focus:bg-accent">Product Badge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border shadow-lg z-[80]">
                <SelectItem value="general" className="text-sm cursor-pointer focus:bg-accent">General Offer</SelectItem>
                <SelectItem value="product" className="text-sm cursor-pointer focus:bg-accent">Product Offer</SelectItem>
                <SelectItem value="bundle" className="text-sm cursor-pointer focus:bg-accent">Bundle Deal</SelectItem>
                <SelectItem value="service" className="text-sm cursor-pointer focus:bg-accent">Service Offer</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center h-10">
              <DesertCheckbox
                checked={form.isFeatured}
                onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                label="Featured"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); resetForm(); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {promotions.map((promo, i) => (
          <FadeIn key={promo.id} delay={i * 0.03}>
          <div className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-sm", !promo.isActive && "opacity-60")}>
            {editId === promo.id ? (
              <div className="space-y-3">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                
                {/* Images in edit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Images</label>
                    <span className="text-xs text-muted-foreground">{form.images.length} image{form.images.length !== 1 ? "s" : ""}</span>
                  </div>
                  
                  {/* Image Gallery */}
                  {form.images.length > 0 && (
                    <div className="space-y-2">
                      {/* Main Image Preview */}
                      <div className="aspect-video w-full max-w-md rounded-lg border border-border bg-muted overflow-hidden">
                        <img 
                          src={form.images[selectedImage]} 
                          alt={`Preview ${selectedImage + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      
                      {/* Thumbnail Grid */}
                      <div className="flex flex-wrap gap-2">
                        {form.images.map((img, idx) => (
                          <div key={idx} className={cn(
                            "relative w-16 h-16 rounded-lg border overflow-hidden cursor-pointer transition-all",
                            selectedImage === idx 
                              ? "border-primary ring-1 ring-primary" 
                              : "border-border hover:border-primary/50"
                          )}>
                            <img 
                              src={img} 
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onClick={() => setSelectedImage(idx)}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newImages = form.images.filter((_, i) => i !== idx);
                                setForm(f => ({ ...f, images: newImages, imageUrl: newImages[0] || "" }));
                                if (selectedImage >= newImages.length) setSelectedImage(Math.max(0, newImages.length - 1));
                              }}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <input ref={editImageInputRef} type="file" accept="image/*" multiple onChange={e => handleImageUpload(e, true)} className="hidden" />
                  <button
                    onClick={() => editImageInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50 transition-all w-full justify-center"
                  >
                    <Upload className={cn("h-4 w-4", uploading && "animate-spin")} />
                    {uploading ? "Uploading..." : "Add Images"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input value={form.discountLabel} onChange={e => setForm(f => ({ ...f, discountLabel: e.target.value }))} placeholder="Discount label"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
                  <Select value={form.placement} onValueChange={v => setForm(f => ({ ...f, placement: v }))}>
                    <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Placement" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      <SelectItem value="HomeHero" className="text-sm cursor-pointer focus:bg-accent">Home Hero</SelectItem>
                      <SelectItem value="FeaturedSection" className="text-sm cursor-pointer focus:bg-accent">Featured Section</SelectItem>
                      <SelectItem value="ProductBadge" className="text-sm cursor-pointer focus:bg-accent">Product Badge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg z-[80]">
                      <SelectItem value="general" className="text-sm cursor-pointer focus:bg-accent">General Offer</SelectItem>
                      <SelectItem value="product" className="text-sm cursor-pointer focus:bg-accent">Product Offer</SelectItem>
                      <SelectItem value="bundle" className="text-sm cursor-pointer focus:bg-accent">Bundle Deal</SelectItem>
                      <SelectItem value="service" className="text-sm cursor-pointer focus:bg-accent">Service Offer</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center h-10">
                    <DesertCheckbox
                      checked={form.isFeatured}
                      onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                      label="Featured"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(promo.id)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Save</button>
                  <button onClick={() => { setEditId(null); resetForm(); }} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {promo.imageUrl ? (
                    <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      <img src={promo.imageUrl} alt={promo.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <Megaphone className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{promo.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {promo.discountLabel && <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{promo.discountLabel}</span>}
                      <span className="text-xs text-muted-foreground">{promo.placement}</span>
                      <span className="text-xs text-muted-foreground">{promo.productCount} products</span>
                      {promo.type && <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{promo.type}</span>}
                      {promo.isFeatured && <span className="text-[10px] font-semibold text-primary">Featured</span>}
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
                  <button onClick={() => setDeleteConfirm(promo.id)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
          </FadeIn>
        ))}
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete promotion?"
        description="This promotion will be permanently removed from the store. This action cannot be undone."
        confirm={{
          label: "Delete Promotion",
          onClick: () => {
            if (deleteConfirm) deletePromotion(deleteConfirm);
            setDeleteConfirm(null);
          },
          variant: "danger",
        }}
      />
    </div>
  );
}
