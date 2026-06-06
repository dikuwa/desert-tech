import { describe, it, expect } from "vitest";
import { parseHumanToCents, centsToHuman } from "./format";

describe("parseHumanToCents", () => {
  it("converts whole dollars to cents", () => {
    expect(parseHumanToCents("4000")).toBe(400000);
    expect(parseHumanToCents("18999")).toBe(1899900);
  });

  it("converts dollars with decimal to cents", () => {
    expect(parseHumanToCents("1.50")).toBe(150);
    expect(parseHumanToCents("0.99")).toBe(99);
    expect(parseHumanToCents("10.00")).toBe(1000);
  });

  it("handles comma-formatted input", () => {
    expect(parseHumanToCents("4,000")).toBe(400000);
    expect(parseHumanToCents("18,999.50")).toBe(1899950);
    expect(parseHumanToCents("1,234,567.89")).toBe(123456789);
  });

  it("strips leading/trailing whitespace", () => {
    expect(parseHumanToCents("  4000  ")).toBe(400000);
    expect(parseHumanToCents("\t18999\n")).toBe(1899900);
  });

  it("returns 0 for empty string", () => {
    expect(parseHumanToCents("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(parseHumanToCents("   ")).toBe(0);
  });

  it("returns 0 for non-numeric input", () => {
    expect(parseHumanToCents("abc")).toBe(0);
    expect(parseHumanToCents("N$ 4000")).toBe(0);
    expect(parseHumanToCents("$100")).toBe(0);
  });

  it("handles large numbers", () => {
    expect(parseHumanToCents("1000000")).toBe(100000000);
    expect(parseHumanToCents("99,999,999.99")).toBe(9999999999);
  });

  it("handles small decimal values", () => {
    expect(parseHumanToCents("0.01")).toBe(1);
    expect(parseHumanToCents("0.10")).toBe(10);
  });

  it("rounds fractional cents", () => {
    expect(parseHumanToCents("1.234")).toBe(123);
    expect(parseHumanToCents("1.235")).toBe(124);
    expect(parseHumanToCents("1.999")).toBe(200);
  });

  it("converts zero correctly", () => {
    expect(parseHumanToCents("0")).toBe(0);
    expect(parseHumanToCents("0.00")).toBe(0);
  });
});

describe("centsToHuman", () => {
  it("converts cents to human format with two decimals", () => {
    expect(centsToHuman(400000)).toBe("4000.00");
    expect(centsToHuman(1899900)).toBe("18999.00");
  });

  it("handles small amounts", () => {
    expect(centsToHuman(150)).toBe("1.50");
    expect(centsToHuman(99)).toBe("0.99");
    expect(centsToHuman(1)).toBe("0.01");
  });

  it("handles zero", () => {
    expect(centsToHuman(0)).toBe("0.00");
  });

  it("handles large values", () => {
    expect(centsToHuman(100000000)).toBe("1000000.00");
    expect(centsToHuman(9999999999)).toBe("99999999.99");
  });

  it("always returns two decimal places", () => {
    expect(centsToHuman(100)).toBe("1.00");
    expect(centsToHuman(101)).toBe("1.01");
    expect(centsToHuman(110)).toBe("1.10");
  });

  it("rounds correctly", () => {
    expect(centsToHuman(123)).toBe("1.23");
    expect(centsToHuman(124)).toBe("1.24");
    expect(centsToHuman(199)).toBe("1.99");
  });
});

describe("roundtrip consistency", () => {
  it("parseHumanToCents ∘ centsToHuman is idempotent", () => {
    const testValues = ["0", "0.01", "1.50", "100", "18999", "18999.99", "1000000", "0.99"];
    for (const val of testValues) {
      const cents = parseHumanToCents(val);
      const backToHuman = centsToHuman(cents);
      expect(parseHumanToCents(backToHuman)).toBe(cents);
    }
  });
});
