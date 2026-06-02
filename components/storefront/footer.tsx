import Link from "next/link";
import { Phone, MessageCircle, Mail, MapPin, Facebook, X, Instagram, Youtube } from "lucide-react";

const categories = [
  { href: "/shop?category=apple", label: "Apple Products" },
  { href: "/shop?category=windows", label: "Windows Laptops" },
  { href: "/shop?category=gaming", label: "Gaming PC" },
  { href: "/shop?category=cctv", label: "CCTV & Security" },
  { href: "/shop?category=networking", label: "Networking" },
  { href: "/shop?category=pos", label: "POS Systems" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/promotions", label: "Promotions" },
];

const quickLinks = [
  { href: "/shop", label: "Shop Products" },
  { href: "/services", label: "Our Services" },
  { href: "/promotions", label: "Promotions" },
  { href: "/contact", label: "Contact Us" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
];

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264852775140";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_STORE_PHONE || "+264852775140";

export function StorefrontFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold tracking-tighter">
              Desert<span className="text-primary">Tech</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary-foreground/60">
              Namibia&apos;s trusted source for new, pre-owned, and refurbished technology
              products. Apple, Windows, Gaming, CCTV, Networking, POS & more.
            </p>
            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-foreground/10 text-secondary-foreground/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-foreground/10 text-secondary-foreground/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <X className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-foreground/10 text-secondary-foreground/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-foreground/10 text-secondary-foreground/60 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-secondary-foreground/80 uppercase">
              Categories
            </h4>
            <ul className="mt-4 space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-secondary-foreground/80 uppercase">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-secondary-foreground/80 uppercase">
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex items-center gap-2 text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  {PHONE_NUMBER}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@deserttechnology.com.na"
                  className="flex items-center gap-2 text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  info@deserttechnology.com.na
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-secondary-foreground/60">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Windhoek, Namibia</span>
              </li>
            </ul>

            {/* Banking Details */}
            <div className="mt-5 pt-4 border-t border-secondary-foreground/10">
              <h5 className="text-xs font-semibold tracking-wider text-secondary-foreground/60 uppercase mb-2">
                Banking Details
              </h5>
              <div className="space-y-1 text-xs text-secondary-foreground/50">
                <p>Desert Technologies</p>
                <p>Standard Bank</p>
                <p className="font-mono">Account: 60003162833</p>
                <p className="font-mono">Branch Code: 082672</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-secondary-foreground/40">
              &copy; {new Date().getFullYear()} Desert Technology Consultant. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-xs text-secondary-foreground/40 hover:text-secondary-foreground/60 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-secondary-foreground/20">|</span>
              <Link
                href="/terms"
                className="text-xs text-secondary-foreground/40 hover:text-secondary-foreground/60 transition-colors"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
