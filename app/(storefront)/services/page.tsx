"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Wifi, Printer, Wrench, MessageCircle, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { buildWhatsAppUrl } from "@/lib/whatsapp-url";
import { fadeUpVariants, motionTransition } from "@/lib/motion";

const services = [
  {
    title: "CCTV & Security",
    description: "Professional security solutions for homes and businesses. We supply and install camera systems, access control, and alarm systems.",
    icon: Shield,
    features: [
      "HD & 4K camera systems",
      "NVR and DVR recorders",
      "Access control systems",
      "Alarm systems",
      "Remote viewing setup",
      "Maintenance and support",
    ],
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop",
  },
  {
    title: "Networking",
    description: "Complete networking solutions for reliable connectivity. From home WiFi to enterprise networks.",
    icon: Wifi,
    features: [
      "WiFi 6/6E access points",
      "Network switches & routers",
      "Structured cabling",
      "Fiber optic installations",
      "Network security",
      "Managed WiFi solutions",
    ],
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
  },
  {
    title: "POS Systems",
    description: "Point of sale hardware and software solutions for retail, hospitality, and service businesses.",
    icon: Printer,
    features: [
      "POS terminals & printers",
      "Barcode scanners",
      "Receipt printers",
      "Cash drawers",
      "Software setup",
      "Ongoing support",
    ],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  },
  {
    title: "Auto & Mechanical",
    description: "Vehicle diagnostic equipment, mechanical service tools, and specialized automotive technology solutions.",
    icon: Wrench,
    features: [
      "Diagnostic scanners",
      "Service tools",
      "Workshop equipment",
      "Auto tech solutions",
      "Installation services",
      "Technical support",
    ],
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop",
  },
];

export default function ServicesPage() {
  const settings = useDashboardStore((s) => s.settings);
  return (
    <div>
      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <motion.h1
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={motionTransition(false, 0.3)}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            Our Services
          </motion.h1>
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={motionTransition(false, 0.38)}
            className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Professional technology services throughout Namibia. Installation, setup,
            maintenance, and support for homes and businesses.
          </motion.p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
          {services.map((service, idx) => {
            const Icon = service.icon;
            const isReversed = idx % 2 === 1;
            return (
              <motion.div
                key={service.title}
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
                transition={motionTransition(false, 0.3 + idx * 0.08)}
                className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center`}
              >
                {/* Image */}
                <div className={`${isReversed ? "md:order-2" : ""}`}>
                  <div className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-border shadow-md">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={isReversed ? "md:order-1" : ""}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <a
                      href={buildWhatsAppUrl(settings.whatsapp || "264852775140", `Hi, I'm interested in your ${service.title} services.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-whatsapp/20 bg-whatsapp-soft px-5 py-2.5 text-sm font-semibold text-whatsapp transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Enquire Now
                    </a>
                    <a
                      href={`tel:${settings.phone || "+264852775140"}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                    >
                      <Phone className="h-4 w-4" />
                      Call Us
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted border-t border-border py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Need a custom solution?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Contact us to discuss your specific requirements. We provide free site assessments.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={buildWhatsAppUrl(settings.whatsapp || "264852775140", "Hi DesertTech, I need help with a custom technology solution.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-whatsapp/20 bg-whatsapp-soft px-6 py-3 text-sm font-semibold text-whatsapp transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp hover:text-white hover:shadow-md"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-sm"
            >
              Send Enquiry
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
