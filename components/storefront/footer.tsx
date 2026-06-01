import Link from "next/link";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Desert<span className="text-primary">Tech</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Namibia&apos;s trusted source for new, pre-owned, and refurbished technology
              products. Apple, Windows, Gaming, CCTV, Networking, POS & more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="tel:+264811234567" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4" /> +264 81 123 4567
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/264811234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us
                </a>
              </li>
              <li>
                <a href="mailto:info@deserttechnology.com.na" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4" /> info@deserttechnology.com.na
                </a>
              </li>
            </ul>
          </div>

          {/* Banking Details */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Banking Details</h4>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Desert TECHNOLOGIES</p>
              <p>Standard Bank</p>
              <p className="font-mono">Account: 60003162833</p>
              <p className="font-mono">Branch Code: 082672</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Desert Technology Consultant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
