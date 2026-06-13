import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authorizePermission, createAuditLog } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import { slugifyProduct } from "@/lib/product-records";

const categorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const brandSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  logo: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

function mapCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    productCount: category._count?.products ?? 0,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
  };
}

function mapBrand(brand: any) {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? "",
    logo: brand.logo ?? undefined,
    isActive: brand.isActive,
    isFeatured: brand.isFeatured,
    sortOrder: brand.sortOrder,
  };
}

export async function GET() {
  if (!db) return NextResponse.json({ categories: [], brands: [] });
  const [categories, brands] = await Promise.all([
    db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.brand.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json(
    {
      categories: categories.map(mapCategory),
      brands: brands.map(mapBrand),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const auth = await authorizePermission(Permissions.CATEGORIES_CREATE);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database is not available." }, { status: 503 });

  const body = await request.json();
  const categories = z.array(categorySchema).parse(body.categories ?? []);
  const brands = z.array(brandSchema).parse(body.brands ?? []);
  const replaceBrands = body.replaceBrands === true;

  await db.$transaction([
    ...(replaceBrands ? [db.brand.deleteMany()] : []),
    ...categories.map((category) => {
      const slug = category.slug || slugifyProduct(category.name);
      return db!.category.upsert({
        where: { slug },
        update: {
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
        },
        create: {
          name: category.name,
          slug,
          description: category.description,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
        },
      });
    }),
    ...brands.map((brand) => {
      const slug = brand.slug || slugifyProduct(brand.name);
      return db!.brand.upsert({
        where: { slug },
        update: {
          name: brand.name,
          description: brand.description,
          logo: brand.logo,
          isActive: brand.isActive,
          isFeatured: brand.isFeatured,
          sortOrder: brand.sortOrder,
        },
        create: {
          name: brand.name,
          slug,
          description: brand.description,
          logo: brand.logo,
          isActive: brand.isActive,
          isFeatured: brand.isFeatured,
          sortOrder: brand.sortOrder,
        },
      });
    }),
  ]);
  await createAuditLog({
    action: "Catalog updated",
    targetType: "catalog",
    targetId: "categories-brands",
    targetLabel: "Categories and Brands",
    metadata: { categories: categories.length, brands: brands.length, replaceBrands },
  });

  return GET();
}
