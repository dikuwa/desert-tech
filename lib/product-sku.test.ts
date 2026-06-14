import { describe, expect, it } from "vitest";
import { generateProductSku, planProductSkuPrefixRepair } from "@/lib/product-sku";

describe("generateProductSku", () => {
  it("uses the company, category, and next category sequence", () => {
    expect(
      generateProductSku("Apple", [
        { sku: "DT-APP-0001" },
        { sku: "DT-LAP-0010" },
        { sku: "dt-app-0003" },
      ]),
    ).toBe("DT-APP-0004");
  });

  it("uses the general category code for an unknown category", () => {
    expect(generateProductSku("Other", [])).toBe("DT-GEN-0001");
  });

  it("uses the current store prefix", () => {
    expect(generateProductSku("General", [{ sku: "DTC-GEN-0009" }], "DTC")).toBe("DTC-GEN-0010");
  });
});

describe("planProductSkuPrefixRepair", () => {
  it("changes only the old starting prefix", () => {
    expect(planProductSkuPrefixRepair([
      { id: "one", sku: "DT-POS-0004" },
      { id: "two", sku: "CUSTOM-DT-0001" },
      { id: "three", sku: "DTC-CCTV-0002" },
    ], "DTC")).toEqual({
      updates: [{ id: "one", currentSku: "DT-POS-0004", nextSku: "DTC-POS-0004" }],
      conflicts: [],
    });
  });

  it("reports conflicts and does not plan unsafe updates", () => {
    expect(planProductSkuPrefixRepair([
      { id: "old", sku: "DT-GEN-0010" },
      { id: "current", sku: "DTC-GEN-0010" },
    ], "DTC")).toEqual({
      updates: [],
      conflicts: [{
        id: "old",
        currentSku: "DT-GEN-0010",
        nextSku: "DTC-GEN-0010",
        conflictingProductIds: ["current"],
      }],
    });
  });

  it("is idempotent once products use the current prefix", () => {
    expect(planProductSkuPrefixRepair([
      { id: "one", sku: "DTC-POS-0004" },
    ], "DTC")).toEqual({ updates: [], conflicts: [] });
  });
});
