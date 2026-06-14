import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authorizePermission, createAuditLog } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  discountLabel: z.string().optional(),
  placement: z.string().optional(),
  type: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  linkedProductId: z.string().optional(),
  linkedCategory: z.string().optional(),
  serviceSlug: z.string().optional(),
  ctaLabel: z.string().optional(),
});

function mapData(data: z.infer<typeof updateSchema>) {
  const { imageUrl, ...rest } = data;
  return { ...rest, ...(imageUrl !== undefined ? { bannerImageUrl: imageUrl } : {}) };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizePermission(Permissions.PROMOTIONS_UPDATE);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database is not available." }, { status: 503 });
  const { id } = await params;
  const before = await db.promotion.findUnique({
    where: { id },
    select: { title: true, isActive: true, isFeatured: true, placement: true },
  });
  const promotion = await db.promotion.update({ where: { id }, data: mapData(updateSchema.parse(await request.json())) });
  await createAuditLog({
    action: "Promotion updated",
    targetType: "promotion",
    targetId: promotion.id,
    targetLabel: promotion.title,
    beforeValues: before ?? undefined,
    afterValues: { title: promotion.title, isActive: promotion.isActive, isFeatured: promotion.isFeatured, placement: promotion.placement },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizePermission(Permissions.PROMOTIONS_DELETE);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database is not available." }, { status: 503 });
  const { id } = await params;
  const promotion = await db.promotion.delete({ where: { id } });
  await createAuditLog({
    action: "Promotion deleted",
    targetType: "promotion",
    targetId: promotion.id,
    targetLabel: promotion.title,
    beforeValues: { isActive: promotion.isActive, isFeatured: promotion.isFeatured, placement: promotion.placement },
  });
  return NextResponse.json({ ok: true });
}
