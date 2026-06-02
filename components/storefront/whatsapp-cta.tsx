import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

export function WhatsAppCTA() {
  return (
    <section className="py-10 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-lg border border-border bg-muted p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-whatsapp/10">
              <MessageCircle className="h-6 w-6 text-whatsapp" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Need help finding something?
              </p>
              <p className="text-sm text-muted-foreground">
                Our team is ready to assist you.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-whatsapp-hover hover:shadow-md"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
