import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import { slugifyProduct } from "@/lib/product-records";

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
}).partial();

const brandSchema = categorySchema.extend({
  logo: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  const permission = type === "brands" ? Permissions.BRANDS_UPDATE : Permissions.CATEGORIES_UPDATE;
  const auth = await authorizePermission(permission);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database is not available." }, { status: 503 });
  const body = await request.json();

  if (type === "brands") {
    const data = brandSchema.parse(body);
    const brand = await db.brand.update({
      where: { id },
      data: { ...data, slug: data.name ? slugifyProduct(data.name) : undefined },
    });
    return NextResponse.json({ item: brand });
  }

  const data = categorySchema.parse(body);
  const category = await db.category.update({
    where: { id },
    data: { ...data, slug: data.name ? slugifyProduct(data.name) : undefined },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ item: { ...category, productCount: category._count.products } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  const permission = type === "brands" ? Permissions.BRANDS_DELETE : Permissions.CATEGORIES_DELETE;
  const auth = await authorizePermission(permission);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database is not available." }, { status: 503 });

  if (type === "brands") {
    await db.brand.delete({ where: { id } });
  } else {
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json({ error: "Move products out of this category before deleting it." }, { status: 409 });
    }
    await db.category.delete({ where: { id } });
  }
  return NextResponse.json({ ok: true });
}
