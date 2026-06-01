import Link from "next/link";
import { Search, MessageCircle, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const categories = [
  { name: "Apple Products", slug: "apple-products", count: 12 },
  { name: "Windows Laptops", slug: "windows-laptops", count: 15 },
  { name: "Gaming PCs", slug: "gaming-pcs", count: 8 },
  { name: "Desktops", slug: "desktops", count: 10 },
  { name: "CCTV & Security", slug: "cctv-security", count: 20 },
  { name: "Networking", slug: "networking", count: 18 },
  { name: "POS Systems", slug: "pos-systems", count: 6 },
  { name: "Accessories", slug: "accessories", count: 25 },
];

const features = [
  {
    title: "Quality Products",
    description: "All products inspected and tested before sale.",
  },
  {
    title: "Competitive Pricing",
    description: "Best prices on new, pre-owned, and refurbished tech.",
  },
  {
    title: "Expert Support",
    description: "Get professional advice before you buy.",
  },
  {
    title: "Namibia-Based",
    description: "Local business serving the Namibian community.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              New, Pre-Owned & Refurbished Tech in{" "}
              <span className="text-primary">Namibia</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Security, Networking, POS & Gadgets. Browse our catalog and order
              via WhatsApp.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" className="px-8 text-base">
                  Shop Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264811234567"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="lg" className="px-8 text-base">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </Button>
              </a>
              <a href={`tel:${process.env.NEXT_PUBLIC_STORE_PHONE || "+264811234567"}`}>
                <Button variant="outline" size="lg" className="px-8 text-base">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                className="rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-muted-foreground/20 hover:shadow-sm"
              >
                <p className="text-sm font-medium text-foreground">{category.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{category.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
            Why Choose Desert Technology?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 text-center">
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            Need Help Choosing?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Our team is ready to help you find the perfect tech solution.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_STORE_WHATSAPP || "264811234567"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-white/90"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </a>
            <a
              href={`tel:${process.env.NEXT_PUBLIC_STORE_PHONE || "+264811234567"}`}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
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
