/**
 * Prisma seed script — populates the database with initial sample data.
 * Run with: npx tsx prisma/seed.ts
 *
 * Note: This requires DATABASE_URL to be set in .env.local
 * and the database to be up-to-date (run `prisma db push` first).
 */

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@deserttech.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@deserttech.com",
      role: "Admin",
      emailVerified: true,
    },
  });

  // Create staff user
  await prisma.user.upsert({
    where: { email: "staff@deserttech.com" },
    update: {},
    create: {
      name: "Staff User",
      email: "staff@deserttech.com",
      role: "Staff",
      emailVerified: true,
    },
  });

  console.log("  ✓ Users created");

  // Create categories
  const categories = [
    { name: "Apple", slug: "apple", description: "MacBooks, iPads, iPhones", sortOrder: 1 },
    { name: "Windows", slug: "windows", description: "Dell, HP, Lenovo laptops", sortOrder: 2 },
    { name: "Gaming", slug: "gaming", description: "Gaming desktops and laptops", sortOrder: 3 },
    { name: "CCTV & Security", slug: "cctv", description: "Cameras and security systems", sortOrder: 4 },
    { name: "Networking", slug: "networking", description: "Routers, switches, WiFi", sortOrder: 5 },
    { name: "Phones & Tablets", slug: "phones", description: "Smartphones and tablets", sortOrder: 6 },
    { name: "Accessories", slug: "accessories", description: "Headsets, mice, keyboards", sortOrder: 7 },
    { name: "POS Systems", slug: "pos", description: "POS hardware and peripherals", sortOrder: 8 },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.name] = created.id;
  }

  console.log("  ✓ Categories created");

  // Create products
  const products = [
    { name: 'MacBook Air 15" M3', slug: "macbook-air-15-m3", sku: "DT-001", brand: "Apple", category: "Apple", priceCents: 1899900, stockQuantity: 8, lowStockThreshold: 3, isFeatured: true, description: "Latest MacBook Air with M3 chip. 15-inch Liquid Retina display, 18GB RAM, 512GB SSD.", specifications: "15.3\" display • Apple M3 • 18GB RAM • 512GB SSD • 18h battery" },
    { name: "Dell XPS 16", slug: "dell-xps-16", sku: "DT-002", brand: "Dell", category: "Windows", priceCents: 2599900, stockQuantity: 2, lowStockThreshold: 3, isFeatured: true, description: "Premium Windows laptop with Intel Core Ultra 7, 32GB RAM, 1TB SSD.", specifications: "16\" OLED • Intel Core Ultra 7 • 32GB RAM • 1TB SSD • Windows 11 Pro" },
    { name: "Gaming PC Ryzen 7", slug: "gaming-pc-ryzen-7-rtx-4070", sku: "DT-003", brand: "Custom Build", category: "Gaming", priceCents: 2199900, stockQuantity: 5, lowStockThreshold: 3, isFeatured: true, description: "High-performance gaming PC with Ryzen 7 and RTX 4070.", specifications: "Ryzen 7 7800X3D • RTX 4070 • 32GB DDR5 • 1TB NVMe • Win 11 Home" },
    { name: "iPad Pro 13\" M4", slug: "ipad-pro-13-m4", sku: "DT-004", brand: "Apple", category: "Apple", priceCents: 1649900, stockQuantity: 0, lowStockThreshold: 3, isFeatured: true, description: "Latest iPad Pro with M4 chip and Ultra Retina XDR display.", specifications: "13\" Ultra Retina XDR • Apple M4 • 256GB • Wi-Fi 6E • USB-C" },
    { name: "Samsung Galaxy S25 Ultra", slug: "samsung-galaxy-s25-ultra", sku: "DT-005", brand: "Samsung", category: "Phones & Tablets", priceCents: 1859900, stockQuantity: 12, lowStockThreshold: 3, isFeatured: true, description: "Samsung's flagship smartphone with advanced AI features.", specifications: "6.9\" Dynamic AMOLED • Snapdragon 8 Gen 4 • 256GB • 200MP Camera" },
    { name: "Hikvision 8CH CCTV Kit", slug: "hikvision-8ch-cctv-kit", sku: "DT-006", brand: "Hikvision", category: "CCTV & Security", priceCents: 599900, stockQuantity: 4, lowStockThreshold: 3, isFeatured: true, description: "Complete 8-channel CCTV kit with 4 cameras and 2TB storage.", specifications: "8CH NVR • 4× 4MP Cameras • 2TB HDD • Night Vision • Mobile App" },
    { name: "Lenovo ThinkPad X1 Carbon", slug: "lenovo-thinkpad-x1-carbon", sku: "DT-007", brand: "Lenovo", category: "Windows", priceCents: 1299900, stockQuantity: 1, lowStockThreshold: 3, isFeatured: false, description: "Business ultrabook with Intel Core i7, 16GB RAM, 512GB SSD.", specifications: "14\" WUXGA • Intel Core i7 • 16GB RAM • 512GB SSD • Win 11 Pro" },
    { name: "Logitech MX Master 3S", slug: "logitech-mx-master-3s", sku: "DT-008", brand: "Logitech", category: "Accessories", priceCents: 159900, stockQuantity: 25, lowStockThreshold: 5, isFeatured: false, description: "Premium wireless mouse with quiet clicks and 8K DPI.", specifications: "Wireless • 8K DPI • Quiet Clicks • USB-C • 70h Battery • Multi-Device" },
    { name: 'MacBook Pro 14" M4 Pro', slug: "macbook-pro-14-m4-pro", sku: "DT-009", brand: "Apple", category: "Apple", priceCents: 2799900, stockQuantity: 3, lowStockThreshold: 3, isFeatured: false, description: "Professional laptop with M4 Pro chip for demanding workflows.", specifications: "14\" Liquid Retina XDR • Apple M4 Pro • 24GB RAM • 512GB SSD" },
    { name: "ASUS ROG Strix G16", slug: "asus-rog-strix-g16", sku: "DT-010", brand: "ASUS", category: "Gaming", priceCents: 2249900, stockQuantity: 1, lowStockThreshold: 3, isFeatured: false, description: "Gaming laptop with RTX 4070 and high-refresh display.", specifications: "16\" QHD 240Hz • Intel i9 • RTX 4070 • 16GB DDR5 • 1TB SSD • Win 11" },
  ];

  for (const product of products) {
    const categoryId = createdCategories[product.category];
    if (!categoryId) {
      console.warn(`  ⚠  Category "${product.category}" not found for product "${product.name}"`);
      continue;
    }
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand,
        categoryId,
        priceCents: product.priceCents,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        isFeatured: product.isFeatured,
        isPublished: true,
        description: product.description,
        specifications: product.specifications,
        availability: product.stockQuantity > 0 ? "InStock" : "OutOfStock",
      },
    });
  }

  console.log("  ✓ Products created");

  // Create promotions
  const promotions = [
    {
      title: "Gaming Setup Bundle",
      slug: "gaming-bundle",
      description: "Complete gaming rig bundle with PC, monitor, keyboard, mouse and headset. Save up to N$ 2,000!",
      discountLabel: "Save up to N$ 2,000",
      placement: "HomeHero",
      isActive: true,
    },
    {
      title: "Back to School Special",
      slug: "back-to-school",
      description: "Student discounts on select laptops and accessories. Up to 15% off!",
      discountLabel: "Up to 15% off",
      placement: "FeaturedSection",
      isActive: true,
    },
    {
      title: "CCTV Bundle Deals",
      slug: "cctv-bundle",
      description: "Security camera bundles with installation support. Save up to N$ 1,500.",
      discountLabel: "Save up to N$ 1,500",
      placement: "FeaturedSection",
      isActive: false,
    },
  ];

  for (const promo of promotions) {
    await prisma.promotion.upsert({
      where: { slug: promo.slug },
      update: {},
      create: promo,
    });
  }

  console.log("  ✓ Promotions created");
  console.log("\n✅ Database seeded successfully!");
  console.log("   Admin login: admin@deserttech.com");
  console.log("   Staff login: staff@deserttech.com");
  console.log("   (Passwords are set via Better Auth sign-up)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    console.log("Done.");
  });
