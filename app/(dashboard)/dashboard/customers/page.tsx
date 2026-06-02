"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, MessageCircle, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { mockCustomers, formatCents } from "@/lib/dashboard-data";

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return mockCustomers;
    const q = search.toLowerCase();
    return mockCustomers.filter(c => c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} customers</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search customers..."
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map(customer => (
          <div key={customer.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary font-semibold text-sm">
                {customer.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{customer.fullName}</p>
                <p className="text-xs text-muted-foreground">{customer.preferredContact}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>{customer.phone}</p>
              {customer.email && <p>{customer.email}</p>}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="text-xs">
                <span className="font-semibold text-foreground">{customer.orderCount}</span> orders · <span className="font-semibold text-foreground">{formatCents(customer.totalSpentCents)}</span>
              </div>
              <div className="flex gap-1">
                {customer.whatsapp && (
                  <a href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="rounded-md p-1.5 text-whatsapp hover:bg-whatsapp/10 transition-colors"><MessageCircle className="h-3.5 w-3.5" /></a>
                )}
                <a href={`tel:${customer.phone}`} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Phone className="h-3.5 w-3.5" /></a>
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Mail className="h-3.5 w-3.5" /></a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No customers found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"> <ChevronLeft className="h-3.5 w-3.5" /> Previous </button>
          <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"> Next <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  );
}
