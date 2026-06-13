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
import { getProductAvailability, resolveLowStockThreshold } from "@/lib/product-sku";
import { getStoreSettings } from "@/lib/store-settings";

const productUpdateSchema = z.object({
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizePermission(Permissions.PRODUCTS_UPDATE);
  if (auth.error) return auth.error;

  if (!db) {
    return NextResponse.json({ error: "Database is not available." }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = productUpdateSchema.parse(body);
    const settings = await getStoreSettings();
    const lowStockThreshold = resolveLowStockThreshold(data.lowStockThreshold, settings.lowStockThreshold);
    const category = await findOrCreateCategory(data.category);
    const imageUrls = normalizeProductImages(data.images, data.imageUrl ?? undefined);
    const before = await db.product.findUnique({
      where: { id },
      select: { name: true, sku: true, stockQuantity: true, priceCents: true },
    });

    const product = await db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku || null,
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
    });
    await createAuditLog({
      action: before?.stockQuantity !== product.stockQuantity ? "Product and stock updated" : "Product updated",
      targetType: "product",
      targetId: product.id,
      targetLabel: product.name,
      beforeValues: before ?? undefined,
      afterValues: { name: product.name, sku: product.sku, stockQuantity: product.stockQuantity, priceCents: product.priceCents },
    });

    return NextResponse.json({
      product: productRecordToDashboardProduct(product as unknown as ProductWithImages),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizePermission(Permissions.PRODUCTS_DELETE);
  if (auth.error) return auth.error;

  if (!db) {
    return NextResponse.json({ error: "Database is not available." }, { status: 503 });
  }

  const { id } = await params;
  const product = await db.product.delete({ where: { id } });
  await createAuditLog({
    action: "Product deleted",
    targetType: "product",
    targetId: product.id,
    targetLabel: product.name,
    beforeValues: { sku: product.sku, stockQuantity: product.stockQuantity, priceCents: product.priceCents },
  });
  return NextResponse.json({ ok: true });
}
