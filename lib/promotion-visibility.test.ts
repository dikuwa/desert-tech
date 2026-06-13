import { describe, expect, it } from "vitest";
import { isPublicPromotion } from "@/lib/promotion-visibility";

const now = new Date("2026-06-14T12:00:00Z");

describe("isPublicPromotion", () => {
  it("shows active promotions within their date window", () => {
    expect(isPublicPromotion({
      isActive: true,
      startsAt: "2026-06-01T00:00:00Z",
      endsAt: "2026-06-30T23:59:59Z",
    }, now)).toBe(true);
  });

  it("hides inactive, future, and expired promotions", () => {
    expect(isPublicPromotion({ isActive: false }, now)).toBe(false);
    expect(isPublicPromotion({ isActive: true, startsAt: "2026-07-01T00:00:00Z" }, now)).toBe(false);
    expect(isPublicPromotion({ isActive: true, endsAt: "2026-06-01T00:00:00Z" }, now)).toBe(false);
  });
});
