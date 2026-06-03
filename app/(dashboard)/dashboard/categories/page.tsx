"use client";

import { useState } from "react";
import { FolderOpen, Plus, Pencil, Check, X, Trash2 } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const categories = useDashboardStore((s) => s.categories);
  const addCategory = useDashboardStore((s) => s.addCategory);
  const updateCategory = useDashboardStore((s) => s.updateCategory);
  const deleteCategory = useDashboardStore((s) => s.deleteCategory);
  const toggleCategoryActive = useDashboardStore((s) => s.toggleCategoryActive);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const startEdit = (cat: typeof categories[0]) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description);
  };

  const saveEdit = (id: string) => {
    updateCategory(id, { name: editName, description: editDescription });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), description: newDesc.trim(), isActive: true, sortOrder: categories.length + 1 });
    setNewName("");
    setNewDesc("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
      </div>

      <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
        <Plus className="h-5 w-5" /> Add Category
      </button>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); setNewName(""); setNewDesc(""); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            {editingId === cat.id ? (
              <div className="space-y-3">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input value={editDescription} onChange={e => setEditDescription(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
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
                  <div className="flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", cat.isActive ? "bg-success" : "bg-gray-300")} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{cat.productCount} products</span>
                    <span>Order: {cat.sortOrder}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => toggleCategoryActive(cat.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      {cat.isActive ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
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
        ))}
      </div>
    </div>
  );
}
