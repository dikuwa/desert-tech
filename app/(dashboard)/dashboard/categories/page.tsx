"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus, Pencil, Check, X, Trash2, Tag, Image as ImageIcon, Eye, EyeOff, Star } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useSearchParams } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DashboardBrand } from "@/lib/dashboard-data";
import { DesertCheckbox } from "@/components/ui/desert-checkbox";

async function saveCatalog(categories: unknown[], brands: unknown[]) {
  const response = await fetch("/api/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories, brands }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not save catalog.");
  return data;
}

export default function CategoriesBrandsPage() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"categories" | "brands">(
    requestedTab === "brands" ? "brands" : "categories",
  );

  useEffect(() => {
    if (requestedTab === "brands" || requestedTab === "categories") {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories &amp; Brands</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage product categories and brands</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
        <button
          onClick={() => setActiveTab("categories")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
            activeTab === "categories"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
            activeTab === "brands"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Tag className="h-3.5 w-3.5" />
          Brands
        </button>
      </div>

      {activeTab === "categories" ? <CategoriesSection /> : <BrandsSection />}
    </div>
  );
}

function CategoriesSection() {
  const categories = useDashboardStore((s) => s.categories);
  const addCategory = useDashboardStore((s) => s.addCategory);
  const updateCategory = useDashboardStore((s) => s.updateCategory);
  const deleteCategory = useDashboardStore((s) => s.deleteCategory);
  const toggleCategoryActive = useDashboardStore((s) => s.toggleCategoryActive);
  const brands = useDashboardStore((s) => s.brands);
  const syncCategories = useDashboardStore((s) => s.syncCategories);
  const syncBrands = useDashboardStore((s) => s.syncBrands);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(categories.length + 1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const startEdit = (cat: typeof categories[0]) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description);
    setEditSortOrder(cat.sortOrder);
  };

  const saveEdit = async (id: string) => {
    try {
      const next = categories.map((cat) => cat.id === id ? { ...cat, name: editName, description: editDescription, sortOrder: editSortOrder } : cat);
      const data = await saveCatalog(next, brands);
      syncCategories(data.categories);
      syncBrands(data.brands);
      setEditingId(null);
      toast.success("Category updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update category.");
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const next = [...categories, { name: newName.trim(), description: newDesc.trim(), isActive: true, sortOrder: newSortOrder }];
      const data = await saveCatalog(next, brands);
      syncCategories(data.categories);
      syncBrands(data.brands);
      setNewName("");
      setNewDesc("");
      setNewSortOrder(categories.length + 2);
      setShowAdd(false);
      toast.success("Category created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create category.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/catalog/categories/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete category.");
      deleteCategory(id);
      setDeleteConfirm(null);
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete category.");
    }
  };

  const handleToggle = async (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    try {
      const response = await fetch(`/api/catalog/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      if (!response.ok) throw new Error("Could not update category.");
      toggleCategoryActive(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update category.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{categories.filter(c => c.isActive).length} active &middot; {categories.length} total</p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Category
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Sort Order</label>
            <input type="number" value={newSortOrder} onChange={e => setNewSortOrder(parseInt(e.target.value) || 0)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); setNewName(""); setNewDesc(""); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, i) => (
          <FadeIn key={cat.id} delay={i * 0.03}>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            {editingId === cat.id ? (
              <div className="space-y-3">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={editDescription} onChange={e => setEditDescription(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Sort Order</label>
                  <input type="number" value={editSortOrder} onChange={e => setEditSortOrder(parseInt(e.target.value) || 0)}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(cat.id)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  <span className={cn("h-2 w-2 rounded-full", cat.isActive ? "bg-success" : "bg-gray-300")} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{cat.productCount} products</span>
                    <span>Order: {cat.sortOrder}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleToggle(cat.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={cat.isActive ? "Deactivate" : "Activate"}>
                      {cat.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    {deleteConfirm === cat.id ? (
                      <button onClick={() => handleDelete(cat.id)} className="rounded-md p-1.5 text-success hover:bg-success-soft transition-colors" title="Confirm delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    ) : (
                      <button onClick={() => setDeleteConfirm(cat.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" title="Delete category"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function BrandsSection() {
  const brands = useDashboardStore((s) => s.brands);
  const addBrand = useDashboardStore((s) => s.addBrand);
  const updateBrand = useDashboardStore((s) => s.updateBrand);
  const deleteBrand = useDashboardStore((s) => s.deleteBrand);
  const toggleBrandActive = useDashboardStore((s) => s.toggleBrandActive);
  const categories = useDashboardStore((s) => s.categories);
  const syncCategories = useDashboardStore((s) => s.syncCategories);
  const syncBrands = useDashboardStore((s) => s.syncBrands);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(brands.length + 1);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sortedBrands = [...brands].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeBrands = brands.filter((b) => b.isActive);

  const startEdit = (br: DashboardBrand) => {
    setEditingId(br.id);
    setEditName(br.name);
    setEditDescription(br.description);
    setEditSortOrder(br.sortOrder);
    setEditIsFeatured(br.isFeatured);
  };

  const saveEdit = async (id: string) => {
    try {
      const next = brands.map((brand) => brand.id === id ? { ...brand, name: editName, description: editDescription, sortOrder: editSortOrder, isFeatured: editIsFeatured } : brand);
      const data = await saveCatalog(categories, next);
      syncCategories(data.categories);
      syncBrands(data.brands);
      setEditingId(null);
      toast.success("Brand updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update brand.");
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const newBrand = {
      name: newName.trim(),
      description: newDesc.trim(),
      isActive: true,
      isFeatured: newIsFeatured,
      sortOrder: newSortOrder,
    };
    try {
      const data = await saveCatalog(categories, [...brands, newBrand]);
      syncCategories(data.categories);
      syncBrands(data.brands);
      setNewName("");
      setNewDesc("");
      setNewSortOrder(brands.length + 2);
      setNewIsFeatured(false);
      setShowAdd(false);
      toast.success("Brand created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create brand.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/catalog/brands/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete brand.");
      deleteBrand(id);
      setDeleteConfirm(null);
      toast.success("Brand deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete brand.");
    }
  };

  const handleToggle = async (id: string) => {
    const brand = brands.find((item) => item.id === id);
    if (!brand) return;
    try {
      const response = await fetch(`/api/catalog/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !brand.isActive }),
      });
      if (!response.ok) throw new Error("Could not update brand.");
      toggleBrandActive(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update brand.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{activeBrands.length} active &middot; {brands.length} total</p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Brand
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Brand name *"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Sort Order</label>
              <input type="number" value={newSortOrder} onChange={e => setNewSortOrder(parseInt(e.target.value) || 0)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
            <div className="flex items-end pb-2">
              <DesertCheckbox 
                checked={newIsFeatured} 
                onChange={(e) => setNewIsFeatured(e.target.checked)}
                label="Featured"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); setNewName(""); setNewDesc(""); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedBrands.map((br, i) => (
          <FadeIn key={br.id} delay={i * 0.03}>
          <div className={cn("rounded-xl border bg-card p-4 transition-all hover:shadow-sm", br.isActive ? "border-border" : "border-dashed border-gray-200 opacity-70")}>
            {editingId === br.id ? (
              <div className="space-y-3">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={editDescription} onChange={e => setEditDescription(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Sort Order</label>
                    <input type="number" value={editSortOrder} onChange={e => setEditSortOrder(parseInt(e.target.value) || 0)}
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex items-end pb-1">
                    <DesertCheckbox 
                      checked={editIsFeatured} 
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                      label="Featured"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(br.id)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-foreground truncate">{br.name}</h3>
                        {br.isFeatured && <Star className="h-3 w-3 text-warning shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{br.description}</p>
                    </div>
                  </div>
                  <span className={cn("h-2 w-2 rounded-full shrink-0 mt-2", br.isActive ? "bg-success" : "bg-gray-300")} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <span>Order: {br.sortOrder}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(br)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleToggle(br.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={br.isActive ? "Deactivate" : "Activate"}>
                      {br.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    {deleteConfirm === br.id ? (
                      <button onClick={() => handleDelete(br.id)} className="rounded-md p-1.5 text-success hover:bg-success-soft transition-colors" title="Confirm delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    ) : (
                      <button onClick={() => setDeleteConfirm(br.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          </FadeIn>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center rounded-xl border border-dashed border-border">
          <Tag className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No brands yet</p>
        </div>
      )}
    </div>
  );
}
