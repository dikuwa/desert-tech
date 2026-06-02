"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs">
            Desert Technology Consultant, Namibia
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl">
            Namibia&rsquo;s tech — tested, warranted, and a message away.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Shop laptops, phones, gaming builds, CCTV, networking and POS gear with clear pricing, tested stock and direct local assistance.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0"
            >
              Shop products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-whatsapp/30 hover:bg-whatsapp-soft hover:text-whatsapp active:translate-y-0"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp an expert
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Tested stock", icon: ShieldCheck },
              { label: "Warranty options", icon: BadgeCheck },
              { label: "Nationwide courier", icon: Truck },
              { label: PHONE_NUMBER, icon: Phone },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 -mr-4 sm:-mr-6 lg:-mr-8 -mb-8 lg:-mb-12 overflow-hidden">
          <img
            src="/images/desert-tech-hero.webp"
            alt="Desert Technology Consultant"
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
