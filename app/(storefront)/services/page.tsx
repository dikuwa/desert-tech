import { Card } from "@/components/ui/card";
import { Shield, Network, Printer, Wrench } from "lucide-react";

const services = [
  {
    title: "CCTV & Security",
    description: "Security camera installation, access control systems, and surveillance solutions for home and business.",
    icon: Shield,
  },
  {
    title: "Networking",
    description: "Network setup, WiFi solutions, structured cabling, and network maintenance services.",
    icon: Network,
  },
  {
    title: "POS Systems",
    description: "Point of sale systems installation, configuration, and support for retail and hospitality businesses.",
    icon: Printer,
  },
  {
    title: "Auto & Mechanical",
    description: "Vehicle diagnostic equipment, mechanical service tools, and auto tech solutions.",
    icon: Wrench,
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Professional technology services for homes and businesses in Namibia.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.title} className="p-8 transition-all hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
