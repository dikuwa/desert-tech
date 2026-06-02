"use client";

import { useState } from "react";
import { FolderOpen, Plus, Pencil, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import { mockCategories } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const startEdit = (cat: typeof mockCategories[0]) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description);
  };

  const saveEdit = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName, description: editDescription } : c));
    setEditingId(null);
  };

  const toggleActive = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
      </div>

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
                    <button onClick={() => toggleActive(cat.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      {cat.isActive ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
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
