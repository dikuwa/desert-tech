import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authorizePermission, createAuditLog } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import { slugifyProduct } from "@/lib/product-records";

const promotionSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(1000).default(""),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  discountLabel: z.string().optional(),
  placement: z.string().default("FeaturedSection"),
  type: z.string().default("general"),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
  linkedProductId: z.string().optional(),
  linkedCategory: z.string().optional(),
  serviceSlug: z.string().optional(),
  ctaLabel: z.string().optional(),
});

function mapPromotion(promotion: any) {
  return {
    id: promotion.id,
    title: promotion.title,
    slug: promotion.slug,
    description: promotion.description ?? "",
    imageUrl: promotion.bannerImageUrl ?? undefined,
    images: Array.isArray(promotion.images) ? promotion.images : undefined,
    discountLabel: promotion.discountLabel ?? undefined,
    placement: promotion.placement,
    type: promotion.type,
    isFeatured: promotion.isFeatured,
    isActive: promotion.isActive,
    sortOrder: promotion.sortOrder,
    startsAt: promotion.startsAt?.toISOString(),
    endsAt: promotion.endsAt?.toISOString(),
    linkedProductId: promotion.linkedProductId ?? undefined,
    linkedCategory: promotion.linkedCategory ?? undefined,
    serviceSlug: promotion.serviceSlug ?? undefined,
    ctaLabel: promotion.ctaLabel ?? undefined,
    productCount: promotion._count?.products ?? 0,
  };
}

export async function GET() {
  if (!db) return NextResponse.json({ promotions: [] });
  const promotions = await db.promotion.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(
    { promotions: promotions.map(mapPromotion) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const auth = await authorizePermission(Permissions.PROMOTIONS_CREATE);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database is not available." }, { status: 503 });

  const data = promotionSchema.parse(await request.json());
  const baseSlug = slugifyProduct(data.title);
  const exists = await db.promotion.findUnique({ where: { slug: baseSlug } });
  const lastPromotion = data.sortOrder === undefined
    ? await db.promotion.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } })
    : null;
  const promotion = await db.promotion.create({
    data: {
      title: data.title,
      slug: exists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug,
      description: data.description,
      bannerImageUrl: data.imageUrl,
      images: data.images,
      discountLabel: data.discountLabel,
      placement: data.placement,
      type: data.type,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      linkedProductId: data.linkedProductId,
      linkedCategory: data.linkedCategory,
      serviceSlug: data.serviceSlug,
      ctaLabel: data.ctaLabel,
      sortOrder: data.sortOrder ?? (lastPromotion?.sortOrder ?? -1) + 1,
    },
    include: { _count: { select: { products: true } } },
  });
  await createAuditLog({
    action: "Promotion created",
    targetType: "promotion",
    targetId: promotion.id,
    targetLabel: promotion.title,
    afterValues: { isActive: promotion.isActive, isFeatured: promotion.isFeatured, placement: promotion.placement },
  });
  return NextResponse.json({ promotion: mapPromotion(promotion) });
}
