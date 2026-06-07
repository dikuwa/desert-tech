import type { DashboardCategory, DashboardProduct } from "@/lib/dashboard-data";

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  condition: "New" | "Refurbished" | "Pre-Owned";
  description: string;
  specs: string;
  priceCents: number;
  oldPriceCents?: number;
  discountPercent?: number;
  imageUrl: string;
  images: string[];
  availability: "in_stock" | "low_stock" | "sold_out";
  stockCount?: number;
  warranty?: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  sku?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  imageUrl?: string;
}

export interface PromotionData {
  id: string;
  title: string;
  slug: string;
  description: string;
  discountLabel?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  placement: string;
  type: "product" | "bundle" | "service" | "general";
  linkedProductId?: string;
  linkedCategory?: string;
  serviceSlug?: string;
  ctaLabel?: string;
}

export const categories: CategoryData[] = [
  { id: "cat-1", name: "Apple", slug: "apple", description: "MacBooks, iPads, iPhones and accessories", productCount: 12, imageUrl: "https://images.unsplash.com/photo-1611186871348-b1f696febbb3?w=200&h=200&fit=crop" },
  { id: "cat-2", name: "Windows", slug: "windows", description: "Dell, HP, Lenovo, ASUS and more", productCount: 15, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop" },
  { id: "cat-3", name: "Gaming", slug: "gaming", description: "Gaming desktops, laptops and accessories", productCount: 8, imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=200&fit=crop" },
  { id: "cat-4", name: "CCTV & Security", slug: "cctv", description: "Cameras, NVRs and security systems", productCount: 20, imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop" },
  { id: "cat-5", name: "Networking", slug: "networking", description: "Routers, switches, cabling and WiFi", productCount: 18, imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop" },
  { id: "cat-6", name: "Phones & Tablets", slug: "phones", description: "Smartphones and tablets", productCount: 10, imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop" },
  { id: "cat-7", name: "Accessories", slug: "accessories", description: "Headsets, mice, keyboards and more", productCount: 25, imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop" },
  { id: "cat-8", name: "POS Systems", slug: "pos", description: "Point of sale hardware and peripherals", productCount: 6, imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop" },
];

export const products: ProductData[] = [
  {
    id: "p1", name: 'MacBook Air 15" M3', slug: "macbook-air-15-m3", brand: "Apple",
    categoryId: "cat-1", categoryName: "Apple", categorySlug: "apple",
    condition: "New", description: "The 15-inch MacBook Air with M3 chip brings a stunning Liquid Retina display, powerful performance, and all-day battery life in an incredibly thin design.",
    specs: "15.3″ Liquid Retina • Apple M3 • 8GB Unified • 256GB SSD",
    priceCents: 1899900, oldPriceCents: 2149900, discountPercent: 12,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "1 Year", rating: 4.8, reviewCount: 24, isFeatured: true,
  },
  {
    id: "p2", name: "Dell XPS 16 Intel Ultra 9", slug: "dell-xps-16", brand: "Dell",
    categoryId: "cat-2", categoryName: "Windows", categorySlug: "windows",
    condition: "New", description: "The Dell XPS 16 delivers desktop-class performance with Intel Core Ultra 9 processor, stunning OLED display, and premium build quality.",
    specs: "16″ OLED • Intel Ultra 9 • 32GB • 1TB SSD",
    priceCents: 2599900,
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=600&h=600&fit=crop"],
    availability: "low_stock", stockCount: 2, warranty: "2 Years", rating: 4.6, reviewCount: 18, isFeatured: true,
  },
  {
    id: "p3", name: "Gaming PC Ryzen 7 RTX 4070", slug: "gaming-pc-ryzen-7-rtx-4070", brand: "Custom Build",
    categoryId: "cat-3", categoryName: "Gaming", categorySlug: "gaming",
    condition: "New", description: "High-performance gaming desktop with AMD Ryzen 7, NVIDIA RTX 4070, 32GB RAM, and 1TB NVMe SSD.",
    specs: "Ryzen 7 7800X3D • RTX 4070 • 32GB • 1TB NVMe",
    priceCents: 2199900, oldPriceCents: 2599900, discountPercent: 15,
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1587831990711-23ca6441417f?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "2 Years", rating: 4.9, reviewCount: 31, isFeatured: true,
  },
  {
    id: "p4", name: "iPad Pro 13″ M4", slug: "ipad-pro-13-m4", brand: "Apple",
    categoryId: "cat-1", categoryName: "Apple", categorySlug: "apple",
    condition: "New", description: "The iPad Pro with M4 chip, Ultra Retina XDR display, and Apple Pencil Pro support.",
    specs: "13″ Ultra Retina XDR • M4 • 256GB • WiFi",
    priceCents: 1649900,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop"],
    availability: "sold_out", warranty: "1 Year", rating: 4.7, reviewCount: 15, isFeatured: true,
  },
  {
    id: "p5", name: "Samsung Galaxy S25 Ultra", slug: "samsung-galaxy-s25-ultra", brand: "Samsung",
    categoryId: "cat-6", categoryName: "Phones & Tablets", categorySlug: "phones",
    condition: "New", description: "The ultimate Galaxy experience with Dynamic AMOLED display, 200MP camera, and S Pen.",
    specs: "6.9″ Dynamic AMOLED • 256GB • 12GB RAM",
    priceCents: 1859900,
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1586050059591-9e212eac5c15?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "1 Year", rating: 4.5, reviewCount: 42, isFeatured: true,
  },
  {
    id: "p6", name: "Hikvision 8CH CCTV Kit", slug: "hikvision-8ch-cctv-kit", brand: "Hikvision",
    categoryId: "cat-4", categoryName: "CCTV & Security", categorySlug: "cctv",
    condition: "New", description: "Complete 8-channel CCTV system with 4MP cameras, NVR, and 2TB storage.",
    specs: "8CH NVR • 4x 4MP • 2TB HDD • IP67",
    priceCents: 599900, oldPriceCents: 749900, discountPercent: 20,
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1577303935007-0d306ee8cf9e?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "3 Years", rating: 4.4, reviewCount: 56, isFeatured: true,
  },
  {
    id: "p7", name: "Lenovo ThinkPad X1 Carbon", slug: "lenovo-thinkpad-x1-carbon", brand: "Lenovo",
    categoryId: "cat-2", categoryName: "Windows", categorySlug: "windows",
    condition: "Refurbished", description: "Business-class ultrabook with Intel Core i7, lightweight carbon fiber design, and enterprise security.",
    specs: "14″ WUXGA • i7-1365U • 16GB • 512GB SSD",
    priceCents: 1299900,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=600&fit=crop"],
    availability: "in_stock", stockCount: 3, warranty: "6 Months", rating: 4.3, reviewCount: 22, isFeatured: true,
  },
  {
    id: "p8", name: "Logitech MX Master 3S", slug: "logitech-mx-master-3s", brand: "Logitech",
    categoryId: "cat-7", categoryName: "Accessories", categorySlug: "accessories",
    condition: "New", description: "Premium wireless mouse with 8K DPI tracking, quiet clicks, and USB-C charging.",
    specs: "Wireless • 8K DPI • USB-C • 70hr battery",
    priceCents: 159900,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "1 Year", rating: 4.6, reviewCount: 89, isFeatured: true,
  },
  {
    id: "p9", name: 'MacBook Pro 14" M4 Pro', slug: "macbook-pro-14-m4-pro", brand: "Apple",
    categoryId: "cat-1", categoryName: "Apple", categorySlug: "apple",
    condition: "New", description: "Professional-grade laptop with M4 Pro chip, 14.2-inch Liquid Retina XDR display.",
    specs: "14.2″ Liquid Retina XDR • M4 Pro • 18GB • 512GB",
    priceCents: 2799900,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "1 Year", rating: 4.9, reviewCount: 37, isFeatured: false,
  },
  {
    id: "p10", name: "ASUS ROG Strix G16", slug: "asus-rog-strix-g16", brand: "ASUS",
    categoryId: "cat-3", categoryName: "Gaming", categorySlug: "gaming",
    condition: "New", description: "Gaming laptop with Intel i9, NVIDIA RTX 4070, 16-inch FHD 165Hz display.",
    specs: "16″ FHD 165Hz • i9-13980HX • RTX 4070 • 16GB • 1TB",
    priceCents: 2249900,
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=600&fit=crop"],
    availability: "low_stock", stockCount: 1, warranty: "2 Years", rating: 4.7, reviewCount: 15, isFeatured: false,
  },
  {
    id: "p11", name: "Ubiquiti UniFi 6 Pro", slug: "ubiquiti-unifi-6-pro", brand: "Ubiquiti",
    categoryId: "cat-5", categoryName: "Networking", categorySlug: "networking",
    condition: "New", description: "Professional WiFi 6 access point with high-density performance and seamless roaming.",
    specs: "WiFi 6 • 5.3 Gbps • PoE+ • 300+ clients",
    priceCents: 289900,
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "2 Years", rating: 4.5, reviewCount: 34, isFeatured: false,
  },
  {
    id: "p12", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", brand: "Sony",
    categoryId: "cat-7", categoryName: "Accessories", categorySlug: "accessories",
    condition: "New", description: "Industry-leading noise cancelling headphones with 30-hour battery life.",
    specs: "Wireless • ANC • 30hr • USB-C • LDAC",
    priceCents: 459900,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "1 Year", rating: 4.7, reviewCount: 73, isFeatured: false,
  },
  {
    id: "p13", name: "iPhone 16 Pro Max", slug: "iphone-16-pro-max", brand: "Apple",
    categoryId: "cat-6", categoryName: "Phones & Tablets", categorySlug: "phones",
    condition: "New", description: "The most advanced iPhone ever with A18 Pro, 48MP camera system, and titanium design.",
    specs: "6.9″ OLED • A18 Pro • 256GB • Titanium",
    priceCents: 2199900,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"],
    availability: "sold_out", rating: 4.8, reviewCount: 65, isFeatured: false,
  },
  {
    id: "p14", name: "Dell 27″ 4K Monitor", slug: "dell-27-4k-monitor", brand: "Dell",
    categoryId: "cat-2", categoryName: "Windows", categorySlug: "windows",
    condition: "Refurbished", description: "Professional 4K UHD monitor with IPS panel, USB-C hub, and ergonomic stand.",
    specs: "27″ 4K UHD • IPS • USB-C • Height Adjust",
    priceCents: 549900, oldPriceCents: 749900, discountPercent: 27,
    imageUrl: "https://images.unsplash.com/photo-1527443225410-41ce3363fbab?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1527443225410-41ce3363fbab?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "6 Months", rating: 4.4, reviewCount: 28, isFeatured: false,
  },
  {
    id: "p15", name: "TP-Link Deco XE75 (3-pack)", slug: "tplink-deco-xe75", brand: "TP-Link",
    categoryId: "cat-5", categoryName: "Networking", categorySlug: "networking",
    condition: "New", description: "Whole-home WiFi 6E mesh system covering up to 5,500 sq. ft.",
    specs: "WiFi 6E • AXE5400 • 3-pack • 5,500 sq ft",
    priceCents: 449900,
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "2 Years", rating: 4.3, reviewCount: 47, isFeatured: false,
  },
  {
    id: "p16", name: "Apple AirPods Pro 2", slug: "apple-airpods-pro-2", brand: "Apple",
    categoryId: "cat-7", categoryName: "Accessories", categorySlug: "accessories",
    condition: "New", description: "Adaptive audio, active noise cancellation, and personalized spatial audio.",
    specs: "Wireless • ANC • USB-C • IP54",
    priceCents: 399900,
    imageUrl: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "1 Year", rating: 4.6, reviewCount: 91, isFeatured: false,
  },
  {
    id: "p17", name: "HP LaserJet Pro M404dn", slug: "hp-laserjet-pro-m404dn", brand: "HP",
    categoryId: "cat-8", categoryName: "POS Systems", categorySlug: "pos",
    condition: "Refurbished", description: "Reliable monochrome laser printer for high-volume business printing.",
    specs: "Auto Duplex • 40ppm • Ethernet • USB",
    priceCents: 349900,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "3 Months", rating: 4.2, reviewCount: 13, isFeatured: false,
  },
  {
    id: "p18", name: "Dahua 4MP PTZ Camera", slug: "dahua-4mp-ptz-camera", brand: "Dahua",
    categoryId: "cat-4", categoryName: "CCTV & Security", categorySlug: "cctv",
    condition: "New", description: "Professional PTZ security camera with 4MP resolution, 25x optical zoom, and smart tracking.",
    specs: "4MP • 25x Zoom • PTZ • IP66 • PoE",
    priceCents: 449900,
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop"],
    availability: "in_stock", warranty: "2 Years", rating: 4.5, reviewCount: 19, isFeatured: false,
  },
];

export const promotions: PromotionData[] = [
  {
    id: "promo-1", title: "Gaming Setup Bundle", slug: "gaming-bundle",
    description: "Complete gaming rig with monitor, keyboard, mouse & headset. Perfect for competitive play.",
    discountLabel: "Save up to N$ 2,000", isActive: true, isFeatured: true, placement: "HomeHero",
    type: "bundle", linkedCategory: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=900&h=620&fit=crop",
  },
  {
    id: "promo-2", title: "CCTV Installation Special", slug: "cctv-installation",
    description: "Professional security camera installation for homes and businesses. Free site assessment included with every booking.",
    discountLabel: "Free Installation", isActive: true, isFeatured: true, placement: "FeaturedSection",
    type: "service", serviceSlug: "cctv",
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=900&h=620&fit=crop",
  },
  {
    id: "promo-3", title: "Back to School Deals", slug: "back-to-school",
    description: "Student discounts on laptops, tablets and accessories. Show your student ID in-store.",
    discountLabel: "Up to 15% off", isActive: true, isFeatured: false, placement: "ProductBadge",
    type: "general", linkedCategory: "laptops",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&h=620&fit=crop",
  },
];

export function getProductBySlug(slug: string): ProductData | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): ProductData[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): ProductData[] {
  return products.filter((p) => p.isFeatured);
}

export function getFeaturedPromotions(): PromotionData[] {
  return promotions.filter(
    (p) => p.isActive && p.isFeatured,
  );
}

export function getAllActivePromotions(): PromotionData[] {
  return promotions.filter((p) => p.isActive);
}

export function getPromotionBySlug(slug: string): PromotionData | undefined {
  return promotions.find((p) => p.slug === slug);
}

export function getPromotionProducts(promotion: PromotionData): ProductData[] {
  switch (promotion.type) {
    case "product":
      return products.filter((p) => p.slug === promotion.linkedProductId);
    case "bundle":
      return promotion.linkedCategory
        ? products.filter(
            (p) =>
              p.categorySlug === promotion.linkedCategory &&
              (p.availability === "in_stock" || p.availability === "low_stock"),
          )
        : [];
    case "service":
      return [];
    case "general":
      return promotion.linkedCategory
        ? products.filter(
            (p) =>
              p.categorySlug === promotion.linkedCategory &&
              (p.availability === "in_stock" || p.availability === "low_stock"),
          )
        : [];
    default:
      return [];
  }
}

export function getCategoryBySlug(slug: string): CategoryData | undefined {
  return categories.find((c) => c.slug === slug);
}

export function searchProducts(query: string): ProductData[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.specs.toLowerCase().includes(q),
  );
}

export function filterProducts(
  params: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
    condition?: string;
    search?: string;
    sort?: string;
  },
  productsArray?: ProductData[],
): ProductData[] {
  let result = [...(productsArray ?? products)];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q),
    );
  }
  if (params.category && params.category !== "all") {
    result = result.filter((p) => p.categorySlug === params.category);
  }
  if (params.brand && params.brand !== "all") {
    result = result.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
  }
  if (params.minPrice !== undefined) {
    result = result.filter((p) => p.priceCents >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    result = result.filter((p) => p.priceCents <= params.maxPrice!);
  }
  if (params.availability && params.availability !== "all") {
    result = result.filter((p) => p.availability === params.availability);
  }
  if (params.condition) {
    result = result.filter((p) => p.condition === params.condition);
  }

  if (params.sort) {
    switch (params.sort) {
      case "price-asc":
        result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-desc":
        result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        break;
      default:
        break;
    }
  }

  return result;
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "Apple": "apple",
  "Windows": "windows",
  "Gaming": "gaming",
  "CCTV & Security": "cctv",
  "Networking": "networking",
  "Phones & Tablets": "phones",
  "Accessories": "accessories",
  "POS Systems": "pos",
};

const CATEGORY_ID_MAP: Record<string, string> = {
  "Apple": "cat-1",
  "Windows": "cat-2",
  "Gaming": "cat-3",
  "CCTV & Security": "cat-4",
  "Networking": "cat-5",
  "Phones & Tablets": "cat-6",
  "Accessories": "cat-7",
  "POS Systems": "cat-8",
};

/**
 * Map a DashboardProduct (from the Zustand store) to the storefront ProductData format.
 * This bridges the gap between products created in the dashboard and products
 * displayed on the storefront shop/home pages.
 */

/**
 * Convert dashboard availability to storefront availability format.
 */
function mapAvailability(avail: string): "in_stock" | "low_stock" | "sold_out" {
  if (avail === "InStock") return "in_stock";
  if (avail === "LowStock") return "low_stock";
  return "sold_out";
}

/**
 * Map a DashboardProduct to the storefront ProductData interface.
 */
export function dashboardProductToProductData(p: DashboardProduct): ProductData {
  const categorySlug = CATEGORY_SLUG_MAP[p.category] || "general";
  const categoryId = CATEGORY_ID_MAP[p.category] || "cat-general";
  const stockCount = p.stockQuantity > 0 ? p.stockQuantity : undefined;
  const fallbackProduct = products.find((product) => product.slug === p.slug);
  const images = p.images && p.images.length > 0
    ? p.images
    : p.imageUrl
      ? [p.imageUrl]
      : fallbackProduct?.images ?? [];
  const imageUrl = p.imageUrl || images[0] || fallbackProduct?.imageUrl || "";

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    categoryId,
    categoryName: p.category,
    categorySlug,
    condition: (p.condition === "New" || p.condition === "Refurbished" || p.condition === "Pre-Owned") ? p.condition : "New",
    description: p.description || fallbackProduct?.description || "",
    specs: p.description?.split(".")[0] || fallbackProduct?.specs || p.name,
    priceCents: p.priceCents,
    oldPriceCents: p.compareAtPriceCents || undefined,
    discountPercent: p.compareAtPriceCents ? Math.round((1 - p.priceCents / p.compareAtPriceCents) * 100) : undefined,
    imageUrl,
    images: images.length > 0 ? images : imageUrl ? [imageUrl] : [],
    availability: mapAvailability(p.availability),
    stockCount,
    warranty: p.warranty || undefined,
    rating: fallbackProduct?.rating ?? 4.0,
    reviewCount: fallbackProduct?.reviewCount ?? 0,
    isFeatured: p.isFeatured,
    sku: p.sku || undefined,
  };
}

/**
 * Merge static products with dashboard-managed products.
 * Dashboard products with matching slugs override static ones.
 */
export function mergeProducts(dashboardProducts: DashboardProduct[]): ProductData[] {
  const mapped = dashboardProducts.map(dashboardProductToProductData);
  const dashboardSlugs = new Set(mapped.map((p) => p.slug));
  // Start with static products that don't have a dashboard override
  const merged = products.filter((p) => !dashboardSlugs.has(p.slug));
  // Append dashboard products at the beginning (newest first)
  return [...mapped, ...merged];
}

export function dashboardCategoryToCategoryData(category: DashboardCategory): CategoryData {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: category.productCount,
  };
}

export function formatNAD(cents: number): string {
  return `N$ ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export const ALL_BRANDS = [...new Set(products.map((p) => p.brand))].sort();
export const ALL_AVAILABILITY = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "sold_out", label: "Out of Stock" },
];
export const ALL_CONDITIONS = ["New", "Refurbished", "Pre-Owned"];
