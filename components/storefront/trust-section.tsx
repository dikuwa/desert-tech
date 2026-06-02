import { Package, Users, ShieldCheck, HeadphonesIcon } from "lucide-react";

const reasons = [
  {
    title: "Wide Range",
    description: "New, pre-used and refurbished tech from top brands.",
    icon: Package,
  },
  {
    title: "Expert Advice",
    description: "Get professional guidance before making a purchase.",
    icon: Users,
  },
  {
    title: "Secure Purchase",
    description: "Cash at store or bank transfer with invoice.",
    icon: ShieldCheck,
  },
  {
    title: "After Sales Support",
    description: "We stand behind every product we sell.",
    icon: HeadphonesIcon,
  },
];

export function TrustSection() {
  return (
    <section className="py-14 bg-muted border-t border-border bg-noise">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Why shop with us
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="flex flex-col items-center text-center rounded-lg border border-border bg-card px-6 py-8 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
