"use client";

import { useState } from "react";
import { Megaphone, Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { mockPromotions } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export default function DashboardPromotionsPage() {
  const [promotions, setPromotions] = useState(mockPromotions);
  const toggleActive = (id: string) => setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">{promotions.filter(p => p.isActive).length} active promotions</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Promotion
        </button>
      </div>

      <div className="grid gap-4">
        {promotions.map(promo => (
          <div key={promo.id} className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-sm", !promo.isActive && "opacity-60")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary"><Megaphone className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {promo.discountLabel && <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{promo.discountLabel}</span>}
                    <span className="text-xs text-muted-foreground">{promo.placement}</span>
                    <span className="text-xs text-muted-foreground">{promo.productCount} products</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(promo.id)}
                  className={cn("rounded-lg p-2 transition-colors", promo.isActive ? "text-success hover:bg-success-soft" : "text-muted-foreground hover:bg-muted")}>
                  {promo.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
