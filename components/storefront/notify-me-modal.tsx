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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  contactValue?: string;
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
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("WhatsApp");
  const [contactValue, setContactValue] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("Flexible");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!customerName.trim()) newErrors.customerName = "Name is required";
    if (!contactValue.trim()) newErrors.contactValue = "Contact value is required";
    if (preferredContact === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
      newErrors.contactValue = "Enter a valid email address";
    }
    if ((preferredContact === "Phone" || preferredContact === "WhatsApp") && contactValue.trim().length < 5) {
      newErrors.contactValue = "Enter a valid phone number";
    }
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
          contactValue: contactValue.trim(),
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

  const handleContactMethodChange = (value: string) => {
    setPreferredContact(value as ContactMethod);
    setErrors((prev) => ({ ...prev, preferredContact: undefined, contactValue: undefined }));
    if (value === "Email") {
      setContactValue("");
    } else {
      setContactValue("");
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setPreferredContact("WhatsApp");
    setContactValue("");
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
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
              <Check className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="text-xl">You&apos;re on the list!</DialogTitle>
            <DialogDescription className="mt-2 max-w-sm text-base">
              We&apos;ll notify you when <span className="font-semibold text-foreground">{productName}</span> is available.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5 text-primary" />
                Notify Me
              </DialogTitle>
              <DialogDescription className="text-base">
                Let us know when <span className="font-semibold text-foreground">{productName}</span> is back.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Your Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => { setCustomerName(e.target.value); setErrors((prev) => ({ ...prev, customerName: undefined })); }}
                  placeholder="e.g. John Mwale"
                  className={cn(errors.customerName && "border-destructive")}
                />
                {errors.customerName && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Preferred Contact */}
              <div className="space-y-1.5">
                <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
                <Select value={preferredContact} onValueChange={handleContactMethodChange}>
                  <SelectTrigger id="preferredContact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Value */}
              <div className="space-y-1.5">
                <Label htmlFor="contactValue">
                  {preferredContact === "WhatsApp"
                    ? "WhatsApp Number *"
                    : preferredContact === "Phone"
                      ? "Phone Number *"
                      : "Email Address *"}
                </Label>
                <Input
                  id="contactValue"
                  type={preferredContact === "Email" ? "email" : "tel"}
                  value={contactValue}
                  onChange={(e) => { setContactValue(e.target.value); setErrors((prev) => ({ ...prev, contactValue: undefined })); }}
                  placeholder={
                    preferredContact === "WhatsApp"
                      ? "e.g. 264812345678"
                      : preferredContact === "Phone"
                        ? "e.g. +264 81 234 5678"
                        : "e.g. john@example.com"
                  }
                  className={cn(errors.contactValue && "border-destructive")}
                />
                {errors.contactValue && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.contactValue}
                  </p>
                )}
              </div>

              {/* Urgency */}
              <div className="space-y-1.5">
                <Label htmlFor="urgency">How urgent is this? *</Label>
                <Select value={urgency} onValueChange={(v) => { setUrgency(v as Urgency); setErrors((prev) => ({ ...prev, urgency: undefined })); }}>
                  <SelectTrigger id="urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.urgency}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label htmlFor="note">Note (optional)</Label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any specific model, colour, or storage preference?"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
