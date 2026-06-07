import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import {
  normalizeProductImages,
  productRecordToDashboardProduct,
  slugifyProduct,
  type ProductWithImages,
} from "@/lib/product-records";

const productSchema = z.object({
  name: z.string().min(2).max(160),
  brand: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  condition: z.string().default("New"),
  priceCents: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
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

  return NextResponse.json({
    products: products.map(productRecordToDashboardProduct),
  });
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
    const category = await findOrCreateCategory(data.category);
    const imageUrls = normalizeProductImages(data.images, data.imageUrl ?? undefined);
    const slugBase = slugifyProduct(data.name);
    const slugExists = await db.product.findUnique({ where: { slug: slugBase } });
    const slug = slugExists ? `${slugBase}-${Date.now().toString(36)}` : slugBase;

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        sku: data.sku || null,
        brand: data.brand,
        categoryId: category.id,
        condition: data.condition,
        description: data.description || "",
        specifications: data.description || null,
        priceCents: data.priceCents,
        compareAtPriceCents: data.compareAtPriceCents || null,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        availability:
          data.availability ??
          (data.stockQuantity <= 0
            ? "OutOfStock"
            : data.stockQuantity <= data.lowStockThreshold
              ? "LowStock"
              : "InStock"),
        warranty: data.warranty || null,
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

    return NextResponse.json({
      product: productRecordToDashboardProduct(product as unknown as ProductWithImages),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
