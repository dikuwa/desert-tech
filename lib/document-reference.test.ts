import { describe, expect, it } from "vitest";
import { createDocumentReference, stripDocumentPrefix } from "@/lib/document-reference";

describe("document references", () => {
  it("uses the current global prefix for new receipts", () => {
    expect(createDocumentReference("DTC", "RCP", "DT-ABC123", "XYZ")).toBe("DTC-RCP-ABC123-XYZ");
  });

  it("uses the current global prefix for quotations", () => {
    expect(createDocumentReference("DTC", "QTN", "ABC123")).toBe("DTC-QTN-ABC123");
  });

  it("strips any historical prefix without assuming DT", () => {
    expect(stripDocumentPrefix("OLD-ABC123")).toBe("ABC123");
  });
});
