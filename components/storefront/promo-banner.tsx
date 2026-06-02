import Link from "next/link";
import { ArrowRight, Camera, Gamepad2, ShieldCheck, TicketPercent } from "lucide-react";

const promos = [
  {
    title: "Gaming setup bundles",
    description: "Pair a ready gaming PC with monitor, keyboard, mouse and headset without hunting item by item.",
    label: "Save up to N$ 2,000",
    href: "/promotions",
    action: "View promotions",
    icon: Gamepad2,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=900&h=620&fit=crop",
    dark: true,
  },
  {
    title: "CCTV installation",
    description: "Get a practical security setup for homes, offices and shops with a free site assessment.",
    label: "Service available",
    href: "/services",
    action: "Book assessment",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=900&h=620&fit=crop",
    dark: false,
  },
];

export function PromoBanner() {
  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {promos.map((promo) => {
            const Icon = promo.icon;
            return (
              <Link
                key={promo.title}
                href={promo.href}
                className="group grid min-h-[300px] overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:grid-cols-[1fr_220px]"
              >
                <div className="flex flex-col justify-between p-6 sm:p-7">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {promo.label}
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold text-foreground">
                      {promo.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      {promo.description}
                    </p>
                  </div>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {promo.action}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                <div className="relative min-h-[190px] overflow-hidden bg-gray-100 sm:min-h-full">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-card/95 text-primary shadow-sm">
                    {promo.dark ? <TicketPercent className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
