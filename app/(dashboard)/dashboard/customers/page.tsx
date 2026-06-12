"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, MessageCircle, Phone, Mail, ChevronLeft, ChevronRight, Plus, Pencil, Check, X, Trash2, ShoppingBag, Eye } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents, getStatusBadgeClass, getStatusLabel } from "@/lib/dashboard-data";
import { buildWhatsAppUrl } from "@/lib/whatsapp-url";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const customers = useDashboardStore((s) => s.customers);
  const orders = useDashboardStore((s) => s.orders);
  const addCustomer = useDashboardStore((s) => s.addCustomer);
  const updateCustomer = useDashboardStore((s) => s.updateCustomer);
  const deleteCustomer = useDashboardStore((s) => s.deleteCustomer);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", whatsapp: "", preferredContact: ["WhatsApp"] as string[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showOrdersFor, setShowOrdersFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q));
  }, [search, customers]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetForm = () => setForm({ fullName: "", phone: "", email: "", whatsapp: "", preferredContact: ["WhatsApp"] });

  const toggleContact = (method: string) => {
    setForm((f) => ({
      ...f,
      preferredContact: f.preferredContact.includes(method)
        ? f.preferredContact.filter((m) => m !== method)
        : [...f.preferredContact, method],
    }));
  };

  const handleAdd = () => {
    if (!form.fullName.trim() || !form.phone.trim()) return;
    addCustomer({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      preferredContact: form.preferredContact,
      lastOrderDate: undefined,
    });
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (c: typeof customers[0]) => {
    setEditId(c.id);
    setForm({ fullName: c.fullName, phone: c.phone, email: c.email || "", whatsapp: c.whatsapp || "", preferredContact: c.preferredContact });
  };

  const handleEdit = (id: string) => {
    if (!form.fullName.trim() || !form.phone.trim()) return;
    updateCustomer(id, {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      preferredContact: form.preferredContact,
    });
    resetForm();
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} customers</p>
        </div>
        <button onClick={() => { setShowAdd(true); resetForm(); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Customer
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search customers..."
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>

      {/* Add Customer Form */}
      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">New Customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Full name *" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone *" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
            <input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="WhatsApp number" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Preferred contact:</span>
            {["WhatsApp", "Phone", "Email"].map(m => (
              <button key={m} onClick={() => toggleContact(m)}
                className={cn("rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  form.preferredContact.includes(m) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                {m}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Create</button>
            <button onClick={() => { setShowAdd(false); resetForm(); }} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((customer, i) => (
          <FadeIn key={customer.id} delay={i * 0.03}>
          <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm hover:-translate-y-0.5">
            {editId === customer.id ? (
              <div className="space-y-3">
                <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Full name" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                <input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="WhatsApp" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(customer.id)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Save</button>
                  <button onClick={() => { setEditId(null); resetForm(); }} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><X className="h-3 w-3" /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary font-semibold text-sm">
                      {customer.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{customer.fullName}</p>
                      <p className="text-xs text-muted-foreground">{Array.isArray(customer.preferredContact) ? customer.preferredContact.join(", ") : customer.preferredContact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(customer)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setConfirmDelete(customer.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowOrdersFor(showOrdersFor === customer.id ? null : customer.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="View orders"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {customer.whatsapp && (
                      <a href={buildWhatsAppUrl(customer.whatsapp)}
                        target="_blank" rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-whatsapp hover:bg-whatsapp/10 transition-colors"><MessageCircle className="h-3.5 w-3.5" /></a>
                    )}
                    <a href={`tel:${customer.phone}`} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Phone className="h-3.5 w-3.5" /></a>
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Mail className="h-3.5 w-3.5" /></a>
                    )}
                  </div>
                </div>

                {/* Order History */}
                {showOrdersFor === customer.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShoppingBag className="h-3 w-3" />
                      Order History
                    </p>
                    {(() => {
                      const customerOrders = orders.filter(
                        (o) =>
                          o.customerName.toLowerCase() === customer.fullName.toLowerCase() &&
                          (o.customerPhone === customer.phone || !customer.phone),
                      );
                      if (customerOrders.length === 0) {
                        return (
                          <p className="text-xs text-muted-foreground">No orders found</p>
                        );
                      }
                      return customerOrders.slice(0, 5).map((o) => (
                        <Link
                          key={o.id}
                          href={`/dashboard/orders/${o.id}`}
                          className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-primary">{o.orderNumber}</span>
                            <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", getStatusBadgeClass(o.fulfillmentStatus))}>
                              {getStatusLabel(o.fulfillmentStatus)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{formatCents(o.subtotalCents)}</span>
                            <span>{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        </Link>
                      ));
                    })()}
                    {customer.orderCount > 5 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{customer.orderCount - 5} more order{customer.orderCount - 5 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          </FadeIn>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No customers found</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={() => setConfirmDelete(null)}
        title="Delete customer?"
        description="This customer will be permanently removed along with their data. This action cannot be undone."
        confirm={{
          label: "Delete Customer",
          onClick: () => {
            if (confirmDelete) handleDelete(confirmDelete);
            setConfirmDelete(null);
          },
          variant: "danger",
        }}
      />

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
