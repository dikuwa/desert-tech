import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authorizePermission, createAuditLog } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import {
  normalizeProductImages,
  productRecordToDashboardProduct,
  slugifyProduct,
  type ProductWithImages,
} from "@/lib/product-records";
import { generateProductSku, getProductAvailability, resolveLowStockThreshold } from "@/lib/product-sku";
import { getStoreSettings } from "@/lib/store-settings";

const productSchema = z.object({
  name: z.string().min(2).max(160),
  brand: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  condition: z.string().default("New"),
  priceCents: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  availability: z.string().optional(),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sku: z.string().max(80).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  compareAtPriceCents: z.number().int().nonnegative().optional().nullable(),
});

async function findOrCreateCategory(name: string) {
  if (!db) throw new Error("Database not available");
  const slug = slugifyProduct(name);
  return db.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug, description: `${name} products` },
  });
}

export async function GET() {
  if (!db) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: { isPublished: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    { products: products.map(productRecordToDashboardProduct) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const auth = await authorizePermission(Permissions.PRODUCTS_CREATE);
  if (auth.error) return auth.error;

  if (!db) {
    return NextResponse.json({ error: "Database is not available." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const data = productSchema.parse(body);
    const settings = await getStoreSettings();
    const lowStockThreshold = resolveLowStockThreshold(data.lowStockThreshold, settings.lowStockThreshold);
    const category = await findOrCreateCategory(data.category);
    const imageUrls = normalizeProductImages(data.images, data.imageUrl ?? undefined);
    const slugBase = slugifyProduct(data.name);
    const slugExists = await db.product.findUnique({ where: { slug: slugBase } });
    const slug = slugExists ? `${slugBase}-${Date.now().toString(36)}` : slugBase;

    const existingProducts = await db.product.findMany({ select: { sku: true } });
    const sku = data.sku?.trim() || generateProductSku(data.category, existingProducts, settings.receiptPrefix);
    if (existingProducts.some((product) => product.sku?.toLowerCase() === sku.toLowerCase())) {
      return NextResponse.json({ error: `SKU "${sku}" already exists.` }, { status: 409 });
    }
    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        brand: data.brand,
        categoryId: category.id,
        condition: data.condition,
        description: data.description || "",
        specifications: data.description || null,
        priceCents: data.priceCents,
        compareAtPriceCents: data.compareAtPriceCents || null,
        stockQuantity: data.stockQuantity,
        lowStockThreshold,
        availability: getProductAvailability(data.stockQuantity, lowStockThreshold),
        warranty: data.warranty?.trim() || "6 Months",
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            altText: data.name,
            sortOrder: index,
          })),
        },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    await createAuditLog({
      action: "Product created",
      targetType: "product",
      targetId: product.id,
      targetLabel: product.name,
      afterValues: { sku: product.sku, stockQuantity: product.stockQuantity, priceCents: product.priceCents },
    });

    return NextResponse.json({
      product: productRecordToDashboardProduct(product as unknown as ProductWithImages),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
