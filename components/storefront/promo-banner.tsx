import Link from "next/link";
import { TicketPercent, ArrowRight, Camera } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gaming Bundle Promo */}
          <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-accent to-orange-50 p-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-bold text-primary-foreground mb-4">
                <TicketPercent className="h-3.5 w-3.5" />
                Limited Offer
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Gaming Setup Bundle
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Complete gaming rig with monitor, keyboard, mouse & headset. 
                Perfect for competitive play.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-success-soft border border-success/20 px-3 py-1.5 text-sm font-semibold text-success">
                Save up to N$ 2,000
              </div>
              <div className="mt-5">
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
                >
                  Shop Promotions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* CCTV Installation Service */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-gray-50 p-8">
            <div className="flex items-start justify-between">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground mb-4">
                  <Camera className="h-3.5 w-3.5" />
                  Professional Service
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  CCTV Installation Services
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                  Professional security camera installation for homes and businesses. 
                  Free site assessment.
                </p>
                <div className="mt-5">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-sm"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Camera className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
