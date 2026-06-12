"use client";

import { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Building2, Banknote, Send, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store/dashboard";
import { buildWhatsAppUrl } from "@/lib/whatsapp-url";

export default function ContactPage() {
  const contactDetails = useDashboardStore((s) => s.contactDetails);
  const bankDetails = useDashboardStore((s) => s.bankDetails);
  const paymentMethods = useDashboardStore((s) => s.paymentMethods);

  const activeContacts = contactDetails.filter((c) => c.isActive);
  const activeBanks = bankDetails.filter((b) => b.isActive);
  const activePayments = paymentMethods.filter((p) => p.isActive);

  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.message) return;

    setFormState("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }
      setFormState("success");
      setFormData({ fullName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setFormState("error");
    }
    setTimeout(() => setFormState("idle"), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Contact Us
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re here to help. Reach out via phone, WhatsApp, email, or use the enquiry form below.
          </p>
        </div>
      </section>

      <section className="py-14 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left: Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeContacts.map((c) => {
                  const Icon = c.type === "phone" ? Phone : c.type === "whatsapp" ? MessageCircle : c.type === "email" ? Mail : MapPin;
                  const href = c.type === "phone" ? `tel:${c.value}` : c.type === "whatsapp" ? buildWhatsAppUrl(c.value) : c.type === "email" ? `mailto:${c.value}` : "#";
                  const color = c.type === "whatsapp" ? "text-whatsapp" : "text-primary";
                  return (
                    <a
                      key={c.id}
                      href={href}
                      target={c.type === "whatsapp" || c.type === "email" ? "_blank" : undefined}
                      rel={c.type === "whatsapp" || c.type === "email" ? "noopener noreferrer" : undefined}
                      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm hover:-translate-y-0.5"
                    >
                      <Icon className={cn("h-5 w-5", color)} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {c.label} {c.type === "whatsapp" ? "WhatsApp" : c.type === "phone" ? "Phone" : c.type === "email" ? "Email" : "Address"}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground break-words">
                          {c.value}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Banking Details */}
              {activeBanks.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Banking Details</h2>
                  </div>
                  <div className="space-y-4">
                    {activeBanks.map((b) => (
                      <div key={b.id} className="space-y-1.5 text-sm">
                        <p className="font-semibold text-foreground">{b.bankName}</p>
                        <div className="space-y-1 text-muted-foreground">
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Account Name</span>
                            <span className="font-medium text-foreground">{b.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Account Number</span>
                            <span className="font-mono font-medium text-foreground">{b.accountNumber}</span>
                          </div>
                          {b.branchCode && (
                            <div className="flex justify-between">
                              <span className="text-foreground/60">Branch Code</span>
                              <span className="font-mono font-medium text-foreground">{b.branchCode}</span>
                            </div>
                          )}
                        </div>
                        {activeBanks.indexOf(b) < activeBanks.length - 1 && (
                          <div className="border-t border-border mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Use your order reference as payment reference when making transfers.
                  </p>
                </div>
              )}

              {/* Payment Methods */}
              {activePayments.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Banknote className="h-5 w-5 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Payment Methods</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activePayments.map((pm) => (
                      <span
                        key={pm.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        {pm.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-1">
                  Send an Enquiry
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Fill in the form and we&apos;ll get back to you as soon as possible.
                </p>

                {formState === "success" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft mb-4">
                      <Check className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Message Sent!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Thank you for reaching out. We&apos;ll respond within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-foreground">Phone / WhatsApp</label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                          placeholder="+264 81 234 5678"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Subject</label>
                        <input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                        placeholder="Tell us what you need..."
                      />
                    </div>

                    {formState === "error" && (
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        Something went wrong. Please try again or contact us directly.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formState === "submitting"}
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {formState === "submitting" ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
