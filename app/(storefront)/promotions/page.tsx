import Link from "next/link";
import { Sparkles, MessageCircle, Phone, ArrowRight, TicketPercent, Clock } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

const activePromotions = [
  {
    title: "Gaming Setup Bundle",
    description: "Complete gaming rig with monitor, keyboard, mouse & headset. Perfect for competitive play.",
    discount: "Save up to N$ 2,000",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop",
    link: "/shop?category=gaming",
  },
  {
    title: "Back to School Special",
    description: "Student discounts on laptops, tablets, and accessories. Show your student ID.",
    discount: "Up to 15% off",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
    link: "/shop?category=laptops",
  },
  {
    title: "CCTV Bundle Deals",
    description: "Complete security camera kits at special bundle prices. Limited stock available.",
    discount: "Save up to N$ 1,500",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop",
    link: "/shop?category=cctv",
  },
  {
    title: "Networking Upgrade",
    description: "Upgrade to WiFi 6/6E for faster, more reliable connectivity throughout your home or office.",
    discount: "Free installation",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
    link: "/shop?category=networking",
  },
];

export default function PromotionsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Limited Time Offers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Promotions & Deals
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Save on top tech products and services. These offers won&apos;t last long.
          </p>
        </div>
      </section>

      {/* Active Promotions */}
      <section className="py-14 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {activePromotions.map((promo) => (
              <Link
                key={promo.title}
                href={promo.link}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                    <TicketPercent className="h-3.5 w-3.5" />
                    {promo.discount}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-foreground">
                    {promo.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {promo.description}
                  </p>
                  <div className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Shop Now
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="bg-muted border-y border-border py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Prices can change
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Promotional prices and discounts are valid while stocks last. Contact us to confirm
            current pricing and availability.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-whatsapp/20 bg-whatsapp-soft px-6 py-3 text-sm font-semibold text-whatsapp transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp hover:text-white hover:shadow-md"
            >
              <MessageCircle className="h-5 w-5" />
              Ask on WhatsApp
            </a>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-sm"
            >
              <Phone className="h-5 w-5" />
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
