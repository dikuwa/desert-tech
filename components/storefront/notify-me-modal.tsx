"use client";

import { useState } from "react";
import { Bell, Check, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fadeUpVariants, motionTransition } from "@/lib/motion";

interface NotifyMeModalProps {
  productId: string;
  productName: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type ContactMethod = "WhatsApp" | "Phone" | "Email";
type Urgency = "ASAP" | "Flexible" | "JustChecking";

interface FormErrors {
  customerName?: string;
  preferredContact?: string;
  contactValues?: Partial<Record<ContactMethod, string>>;
  urgency?: string;
}

export function NotifyMeModal({
  productId,
  productName,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: NotifyMeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [customerName, setCustomerName] = useState("");
  const [preferredContact, setPreferredContact] = useState<ContactMethod[]>(["WhatsApp"]);
  const [contactValues, setContactValues] = useState<Record<ContactMethod, string>>({
    WhatsApp: "",
    Phone: "",
    Email: "",
  });
  const [urgency, setUrgency] = useState<Urgency>("Flexible");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const reducedMotion = useReducedMotion();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Name is required";
    if (preferredContact.length === 0) newErrors.preferredContact = "Select at least one contact method";
    const contactErrors: Partial<Record<ContactMethod, string>> = {};
    for (const method of preferredContact) {
      const value = contactValues[method].trim();
      if (!value) {
        contactErrors[method] = `${method} contact is required`;
      } else if (method === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        contactErrors[method] = "Enter a valid email address";
      } else if ((method === "Phone" || method === "WhatsApp") && value.length < 5) {
        contactErrors[method] = "Enter a valid phone number";
      }
    }
    if (Object.keys(contactErrors).length > 0) newErrors.contactValues = contactErrors;
    if (!urgency) newErrors.urgency = "Select urgency";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/back-in-stock-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          customerName: customerName.trim(),
          preferredContact,
          contactValues: Object.fromEntries(
            preferredContact.map((method) => [method, contactValues[method].trim()]),
          ),
          urgency,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate) {
          toast.info("You've already requested this item. We'll let you know when it's back!");
        } else {
          toast.error(data.error || "Something went wrong. Please try again.");
        }
        if (!data.duplicate) {
          setSubmitting(false);
          return;
        }
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch {
      toast.error("Something went wrong. Please try again or contact us directly.");
      setSubmitting(false);
    }
  };

  const toggleContactMethod = (method: ContactMethod) => {
    setPreferredContact((methods) =>
      methods.includes(method)
        ? methods.filter((item) => item !== method)
        : [...methods, method],
    );
    setErrors((prev) => ({ ...prev, preferredContact: undefined }));
  };

  const resetForm = () => {
    setCustomerName("");
    setPreferredContact(["WhatsApp"]);
    setContactValues({ WhatsApp: "", Phone: "", Email: "" });
    setUrgency("Flexible");
    setNote("");
    setSubmitted(false);
    setErrors({});
  };

  const defaultTrigger = (
    <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted">
      <Bell className="h-3.5 w-3.5" />
      Notify Me
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { setOpen(newOpen); if (!newOpen) setTimeout(resetForm, 300); }}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md !px-7 !pt-7 !pb-6">
        <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="success"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={motionTransition(reducedMotion)}
            className="flex flex-col items-center py-8 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
              <Check className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="text-xl">You&apos;re on the list!</DialogTitle>
            <DialogDescription className="mt-2 max-w-sm text-base">
              We&apos;ll notify you when <span className="font-semibold text-foreground">{productName}</span> is available.
            </DialogDescription>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={motionTransition(reducedMotion)}
            className="space-y-4"
          >
            <DialogHeader className="gap-1.5">
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Notify Me
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Let us know when <span className="font-semibold text-foreground">{productName}</span> is back.
              </DialogDescription>
            </DialogHeader>

            <div className="h-px bg-border/60 -mx-7 mb-4" />

            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-xs font-medium text-foreground">Your Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => { setCustomerName(e.target.value); setErrors((prev) => ({ ...prev, customerName: undefined })); }}
                  placeholder="e.g. John Mwale"
                  className={cn(
                    "h-[50px] border-border/70 px-4 text-sm focus:border-primary focus:ring-0 rounded-xl",
                    errors.customerName && "border-destructive"
                  )}
                />
                {errors.customerName && (
                  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Preferred Contact */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Preferred Contact Methods *</Label>
                <div className="flex rounded-xl border border-border/70 overflow-hidden">
                  {(["WhatsApp", "Phone", "Email"] as ContactMethod[]).map((method, idx) => (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={preferredContact.includes(method)}
                      onClick={() => toggleContactMethod(method)}
                      className={cn(
                        "flex-1 px-4 py-2.5 text-xs font-semibold transition-colors text-center",
                        idx > 0 && "border-l border-border/70",
                        preferredContact.includes(method)
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                {errors.preferredContact && <p className="text-xs text-destructive mt-1">{errors.preferredContact}</p>}
              </div>

              {preferredContact.map((method) => (
                <div key={method} className="space-y-1.5">
                  <Label htmlFor={`contact-${method}`} className="text-xs font-medium text-foreground">
                    {method === "Email" ? "Email Address *" : `${method} Number *`}
                  </Label>
                  <Input
                    id={`contact-${method}`}
                    type={method === "Email" ? "email" : "tel"}
                    value={contactValues[method]}
                    onChange={(e) => {
                      setContactValues((values) => ({ ...values, [method]: e.target.value }));
                      setErrors((prev) => ({
                        ...prev,
                        contactValues: { ...prev.contactValues, [method]: undefined },
                      }));
                    }}
                    placeholder={method === "Email" ? "e.g. john@example.com" : "e.g. +264 81 234 5678"}
                    className={cn(
                      "h-[50px] border-border/70 px-4 text-sm focus:border-primary focus:ring-0 rounded-xl",
                      errors.contactValues?.[method] && "border-destructive"
                    )}
                  />
                  {errors.contactValues?.[method] && (
                    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.contactValues[method]}
                    </p>
                  )}
                </div>
              ))}

              {/* Urgency */}
              <div className="space-y-1.5">
                <Label htmlFor="urgency" className="text-xs font-medium text-foreground">How urgent is this? *</Label>
                <Select value={urgency} onValueChange={(v) => { setUrgency(v as Urgency); setErrors((prev) => ({ ...prev, urgency: undefined })); }}>
                  <SelectTrigger id="urgency" className="h-[50px] border-border/70 px-4 text-sm rounded-xl focus:border-primary focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/70">
                    <SelectItem value="ASAP">
                      ASAP — Need it soon
                    </SelectItem>
                    <SelectItem value="Flexible">
                      Flexible — Happy to wait
                    </SelectItem>
                    <SelectItem value="JustChecking">
                      Just Checking — Send me info
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.urgency && (
                  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.urgency}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-medium text-foreground">Note (optional)</Label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any specific model, colour, or storage preference?"
                  rows={3}
                  className="flex w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="notify-submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Notify Me
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
              We&apos;ll only use this to notify you about product availability.
            </p>
          </motion.div>
        )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
