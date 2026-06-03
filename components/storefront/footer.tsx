"use client";

import Link from "next/link";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

export function StorefrontFooter() {
  const settings = useDashboardStore((s) => s.settings);
  const whatsapp = settings.whatsapp || WHATSAPP_NUMBER;
  const phone = settings.phone || PHONE_NUMBER;
  const email = settings.email || "info@deserttechnology.com.na";
  const address = settings.address || "Windhoek, Namibia";
  const bankName = settings.bankName || "Standard Bank";
  const bankAccountName = settings.bankAccountName || "Desert TECHNOLOGIES";
  const bankAccountNumber = settings.bankAccountNumber || "60003162833";
  const bankBranchCode = settings.bankBranchCode || "082672";
  return (
    <footer className="bg-[#0d41e1] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/images/desert-tech-logo.svg"
                alt="Desert Tech"
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="text-lg font-bold">DesertTech</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Namibia&apos;s trusted source for new, pre-owned, and refurbished technology products — laptops, phones, gaming, CCTV, networking, POS & more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/shop", label: "Shop Products" },
                { href: "/services", label: "Services" },
                { href: "/promotions", label: "Promotions" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-white/10">
              <h5 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Banking Details</h5>
              <div className="space-y-1 text-xs text-white/50">
                <p>{bankAccountName} — {bankName}</p>
                <p className="font-mono">Account: {bankAccountNumber} | Branch: {bankBranchCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <p>&copy; {new Date().getFullYear()} Desert Technology Consultant. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms &amp; Conditions</Link>
              <span>|</span>
              <a href="https://www.flextech-media.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Designed by FlexTech Media</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
