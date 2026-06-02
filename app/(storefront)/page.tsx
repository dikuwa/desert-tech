import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/storefront/hero-section";
import { CategoryCards } from "@/components/storefront/category-cards";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductCard, type ProductData } from "@/components/storefront/product-card";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { TrustSection } from "@/components/storefront/trust-section";
import { WhatsAppCTA } from "@/components/storefront/whatsapp-cta";

const featuredProducts: ProductData[] = [
  {
    id: "1",
    name: 'MacBook Air 15" M3',
    slug: "macbook-air-15-m3",
    specs: "15.3″ Liquid Retina • 8GB • 256GB",
    priceCents: 1899900,
    oldPriceCents: 2149900,
    discountPercent: 12,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd6ca8?w=400&h=400&fit=crop",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "2",
    name: "Dell XPS 16 Intel Ultra 9",
    slug: "dell-xps-16",
    specs: "16″ OLED • 32GB • 1TB SSD",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    priceCents: 2599900,
    availability: "low_stock",
    stockCount: 2,
    rating: 4.6,
    reviewCount: 18,
  },
  {
    id: "3",
    name: "Gaming PC Ryzen 7 RTX 4070",
    slug: "gaming-pc-ryzen-7-rtx-4070",
    specs: "Ryzen 7 • RTX 4070 • 32GB • 1TB",
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop",
    priceCents: 2199900,
    oldPriceCents: 2599900,
    discountPercent: 15,
    availability: "in_stock",
    rating: 4.9,
    reviewCount: 31,
  },
  {
    id: "4",
    name: "iPad Pro 13″ M4",
    slug: "ipad-pro-13-m4",
    specs: "13″ Ultra Retina XDR • 256GB • WiFi",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    priceCents: 1649900,
    availability: "sold_out",
    rating: 4.7,
    reviewCount: 15,
  },
  {
    id: "5",
    name: "Samsung Galaxy S25 Ultra",
    slug: "samsung-galaxy-s25-ultra",
    specs: "6.9″ Dynamic AMOLED • 256GB",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    priceCents: 1859900,
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 42,
  },
  {
    id: "6",
    name: "Hikvision 8CH CCTV Kit",
    slug: "hikvision-8ch-cctv-kit",
    specs: "8CH NVR • 4x 4MP Cameras • 2TB HDD",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    priceCents: 599900,
    oldPriceCents: 749900,
    discountPercent: 20,
    availability: "in_stock",
    rating: 4.4,
    reviewCount: 56,
  },
  {
    id: "7",
    name: "Lenovo ThinkPad X1 Carbon",
    slug: "lenovo-thinkpad-x1-carbon",
    specs: "14″ WUXGA • 16GB • 512GB SSD",
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop",
    priceCents: 1799900,
    availability: "low_stock",
    stockCount: 3,
    rating: 4.3,
    reviewCount: 22,
  },
  {
    id: "8",
    name: "Logitech MX Master 3S",
    slug: "logitech-mx-master-3s",
    specs: "Wireless • 8K DPI • USB-C",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    priceCents: 159900,
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 89,
  },
];

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryCards />
      <section className="py-12 bg-muted border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Featured Products
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Top tech picks at the best prices
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mb-6">
            <ProductFilters />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      <PromoBanner />
      <TrustSection />
      <WhatsAppCTA />
    </div>
  );
}
