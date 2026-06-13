import { describe, expect, it } from "vitest";
import { generateProductSku } from "@/lib/product-sku";

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
