import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

export function WhatsAppCTA() {
  return (
    <section className="bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-secondary p-6 text-secondary-foreground sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-foreground/10">
              <MessageCircle className="h-6 w-6 text-whatsapp" />
            </div>
            <div>
              <p className="text-base font-semibold">
                Need help choosing the right device?
              </p>
              <p className="text-sm text-secondary-foreground/70">
                Send your budget and use case, the team can recommend a practical match.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-whatsapp/20 bg-whatsapp-soft px-5 py-2.5 text-sm font-semibold text-whatsapp transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp hover:text-white hover:shadow-md"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary-foreground/20 px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary-foreground/10"
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
