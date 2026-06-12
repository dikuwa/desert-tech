"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, MessageCircle, Phone, Mail, ChevronLeft, ChevronRight, User, FileText, X } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { getStatusBadgeClass } from "@/lib/dashboard-data";
import { formatPhone } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp-url";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const FILTERS = ["Pending", "Done"] as const;

export default function FollowUpsPage() {
  const followUps = useDashboardStore((s) => s.followUps);
  const markFollowUpDone = useDashboardStore((s) => s.markFollowUpDone);
  const reopenFollowUp = useDashboardStore((s) => s.reopenFollowUp);
  const orders = useDashboardStore((s) => s.orders);
  const storeSettings = useDashboardStore((s) => s.settings);
  const [filter, setFilter] = useState<string>("Pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null);

  const filtered = followUps.filter(f => f.status === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const selected = selectedFollowUp ? followUps.find(f => f.id === selectedFollowUp) : null;
  const selectedOrder = selected ? orders.find(o => o.orderNumber === selected.orderNumber) : null;

  // Email sending state
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async (email?: string) => {
    const recipientEmail = email || emailInput;
    if (!recipientEmail || !selected) {
      setShowEmailInput(true);
      return;
    }
    setSendingEmail(true);
    setShowEmailInput(false);
    try {
      // Try sending via the system email API with corrected Resend config
      const emailRes = await fetch("/api/documents/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "receipt",
          recipientEmail,
          recipientName: selected.customerName,
          documentNumber: selected.orderNumber,
          subject: `Follow-up: ${selected.orderNumber} - ${storeSettings.storeName}`,
          messageBody: `Follow-up regarding ${selected.customerName} - ${selected.orderNumber}\n\n${selected.note || ""}`,
        }),
      });
      const emailData = await emailRes.json();
      if (emailData.success) {
        toast.success("Follow-up email sent via system email");
        setSendingEmail(false);
        setEmailInput("");
        return;
      }
    } catch {
      // Fall through to mailto fallback
    }
    // Fallback: open email client
    const subject = encodeURIComponent(`Follow-up: ${selected.orderNumber}`);
    const body = encodeURIComponent(
      `Regarding ${selected.customerName} - ${selected.orderNumber}\n\n${selected.note || ""}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast.error("System email unavailable, opened mail client instead");
    setSendingEmail(false);
    setEmailInput("");
  };

  const handleMarkDone = (id: string) => {
    markFollowUpDone(id);
    toast.success("Follow-up marked as done");
  };

  const handleReopen = (id: string) => {
    reopenFollowUp(id);
    toast.success("Follow-up reopened");
  };

  const countLabel = filter === "Pending"
    ? `${followUps.filter(f => f.status === "Pending").length} pending`
    : `${followUps.filter(f => f.status === "Done").length} done`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Follow-ups</h1>
        <p className="text-sm text-muted-foreground mt-1">{countLabel} follow-ups</p>
      </div>

      {/* Filters: only Pending and Done */}
      <div className="flex items-center gap-3">
        {FILTERS.map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setCurrentPage(1); }}
            className={cn(
              "rounded-lg border px-4 py-2 text-xs font-semibold transition-colors",
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Follow-up cards */}
      <div className="space-y-2">
        {paginated.map((f, i) => (
          <FadeIn key={f.id} delay={i * 0.03}>
            <div
              className={cn(
                "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm cursor-pointer",
                f.status === "Done" && "opacity-50",
              )}
              onClick={() => setSelectedFollowUp(f.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    f.type === "WhatsApp" ? "bg-whatsapp/10 text-whatsapp" :
                    f.type === "Phone" ? "bg-primary/10 text-primary" : "bg-info-soft text-info",
                  )}>
                    {f.type === "WhatsApp" ? <MessageCircle className="h-4 w-4" /> :
                     f.type === "Phone" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{f.customerName}</p>
                      <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(f.status))}>{f.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.orderNumber} · {f.type}</p>
                    {f.note && <p className="text-xs text-foreground mt-1 line-clamp-2">{f.note}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                      {f.assignedTo && <span>{f.assignedTo}</span>}
                      {f.dueAt && <span>Due {new Date(f.dueAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                {f.status === "Pending" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkDone(f.id); }}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-success hover:bg-success-soft transition-colors shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Done
                  </button>
                )}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <CalendarClock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No {filter.toLowerCase()} follow-ups</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "Pending" ? "All follow-ups are done. Great work!" : "No completed follow-ups yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /> Previous</button>
          <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40">Next <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Follow-up Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setSelectedFollowUp(null)}>
          <div
            className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  selected.type === "WhatsApp" ? "bg-whatsapp/10 text-whatsapp" :
                  selected.type === "Phone" ? "bg-primary/10 text-primary" : "bg-info-soft text-info",
                )}>
                  {selected.type === "WhatsApp" ? <MessageCircle className="h-4 w-4" /> :
                   selected.type === "Phone" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selected.customerName}</p>
                  <p className="text-[11px] text-muted-foreground">{selected.orderNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", getStatusBadgeClass(selected.status))}>{selected.status}</span>
                <button onClick={() => setSelectedFollowUp(null)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Contact Method</p>
                  <p className="text-sm font-medium text-foreground">{selected.type}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Assigned To</p>
                  <p className="text-sm font-medium text-foreground">{selected.assignedTo || "Unassigned"}</p>
                </div>
                {selected.dueAt && (
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Due Date</p>
                    <p className="text-sm font-medium text-foreground">{new Date(selected.dueAt).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium text-foreground">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Note */}
              {selected.note && (
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Note</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selected.note}</p>
                </div>
              )}

              {/* Contact details from the order */}
              {selectedOrder && (
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Customer Contact</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground">{selectedOrder.customerPhone}</span>
                    </div>
                    {selectedOrder.preferredContact && selectedOrder.preferredContact.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Prefers {Array.isArray(selectedOrder.preferredContact) ? selectedOrder.preferredContact.join(", ") : selectedOrder.preferredContact}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {/* WhatsApp — only if type is WhatsApp or phone exists */}
                  {(selected.type === "WhatsApp" || selectedOrder?.customerPhone) && (
                    <a
                      href={buildWhatsAppUrl(selectedOrder?.customerPhone || "", `Hi ${selected.customerName}, regarding your order ${selected.orderNumber}...`)}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-whatsapp/20 px-3 py-2 text-xs font-medium text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
                      onClick={() => {
                        if (!formatPhone(selectedOrder?.customerPhone || "")) {
                          toast.error("No WhatsApp number available for this customer.");
                        }
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  )}

                  {/* Phone call */}
                  {selectedOrder?.customerPhone && (
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                  )}

                  {/* Email — try system sender first, fall back to mailto */}
                  {(selected.type === "Email" || selectedOrder?.customerPhone) && (
                    <button
                      onClick={() => {
                        setShowEmailInput(true);
                      }}
                      disabled={sendingEmail}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      Email
                    </button>
                  )}

                  {/* View order */}
                  {selectedOrder && (
                    <a
                      href={`/dashboard/orders/${selectedOrder.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Order
                    </a>
                  )}

                  {/* Mark Done / Reopen */}
                  {selected.status === "Pending" ? (
                    <button
                      onClick={() => { handleMarkDone(selected.id); setSelectedFollowUp(null); }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-success/20 px-3 py-2 text-xs font-medium text-success hover:bg-success hover:text-white transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Done
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopen(selected.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      Reopen
                    </button>
                  )}
                </div>

                {/* No contact info available */}
                {!selectedOrder?.customerPhone && selected.type !== "Email" && (
                  <p className="text-xs text-muted-foreground italic">No contact information available for this customer.</p>
                )}
              </div>
            </div>

            {/* Email input prompt */}
            {showEmailInput && (
              <div className="border-t border-border p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground">Send email to customer:</p>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="customer@example.com"
                  autoFocus
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendEmail(emailInput); if (e.key === "Escape") { setShowEmailInput(false); setEmailInput(""); }}}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendEmail(emailInput)}
                    disabled={!emailInput || sendingEmail}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {sendingEmail ? "Sending..." : "Send via System Email"}
                  </button>
                  <button
                    onClick={() => { setShowEmailInput(false); setEmailInput(""); }}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
