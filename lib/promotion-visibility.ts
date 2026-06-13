import type { DashboardPromotion } from "@/lib/dashboard-data";

export function isPublicPromotion(
  promotion: Pick<DashboardPromotion, "isActive" | "startsAt" | "endsAt">,
  now = new Date(),
): boolean {
  if (!promotion.isActive) return false;

  const nowMs = now.getTime();
  const startsAt = promotion.startsAt ? new Date(promotion.startsAt).getTime() : null;
  const endsAt = promotion.endsAt ? new Date(promotion.endsAt).getTime() : null;

  if (startsAt !== null && Number.isFinite(startsAt) && startsAt > nowMs) return false;
  if (endsAt !== null && Number.isFinite(endsAt) && endsAt < nowMs) return false;
  return true;
}
