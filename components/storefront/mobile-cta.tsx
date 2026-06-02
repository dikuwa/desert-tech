"use client";

import { MessageCircle, Phone } from "lucide-react";

export function MobileStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="flex items-center gap-2 px-4 py-2">
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-whatsapp/20 bg-whatsapp-soft px-4 py-3 text-sm font-medium text-whatsapp transition-colors hover:bg-whatsapp hover:text-white"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp Us
        </a>
        <a
          href={`tel:${process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140"}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Phone className="h-5 w-5" />
          Call Now
        </a>
      </div>
    </div>
  );
}
