import { describe, it, expect } from "vitest";
import { generateOrdersCSV, generateOrdersExportHTML } from "./export-utils";
import type { DashboardOrder } from "./dashboard-data";

const mockOrders: DashboardOrder[] = [
  {
    id: "o1",
    orderNumber: "DT-A1B2C3",
    customerName: "John Mwale",
    customerPhone: "+264 81 123 4567",
    itemCount: 2,
    subtotalCents: 2499900,
    contactStatus: "NotContacted",
    paymentStatus: "Unpaid",
    fulfillmentStatus: "Pending",
    preferredContact: ["WhatsApp"],
    createdAt: "2026-06-01T10:30:00Z",
    updatedAt: "2026-06-01T10:30:00Z",
  },
  {
    id: "o2",
    orderNumber: "DT-J0K1L2",
    customerName: "Selma Amadhila",
    customerPhone: "+264 85 456 7890",
    itemCount: 1,
    subtotalCents: 599900,
    contactStatus: "Contacted",
    paymentStatus: "PaidInFull",
    fulfillmentStatus: "Completed",
    preferredContact: ["Email"],
    createdAt: "2026-05-25T16:20:00Z",
    updatedAt: "2026-05-26T10:00:00Z",
  },
];

describe("generateOrdersCSV", () => {
  it("should generate CSV with headers", () => {
    const csv = generateOrdersCSV(mockOrders);
    expect(csv).toContain("Order,Customer,Phone,Items,Total,Contact,Payment,Fulfillment,Date");
  });

  it("should include order data rows", () => {
    const csv = generateOrdersCSV(mockOrders);
    expect(csv).toContain("DT-A1B2C3");
    expect(csv).toContain("John Mwale");
    expect(csv).toContain("DT-J0K1L2");
    expect(csv).toContain("Selma Amadhila");
  });

  it("should have the correct number of rows (header + data)", () => {
    const csv = generateOrdersCSV(mockOrders);
    const lines = csv.split("\n");
    expect(lines.length).toBe(3); // header + 2 data rows
  });

  it("should format prices correctly", () => {
    const csv = generateOrdersCSV(mockOrders);
    expect(csv).toContain("N$ 24,999");
    expect(csv).toContain("N$ 5,999");
  });

  it("should wrap values in quotes", () => {
    const csv = generateOrdersCSV(mockOrders);
    const lines = csv.split("\n");
    // Data rows should have quoted values (9 columns now)
    expect(lines[1]).toMatch(/^".*",".*",".*",".*",".*",".*",".*",".*",".*"$/);
  });

  it("should return empty headers-only CSV for empty orders", () => {
    const csv = generateOrdersCSV([]);
    const lines = csv.split("\n");
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe("Order,Customer,Phone,Items,Total,Contact,Payment,Fulfillment,Date");
  });
});

describe("generateOrdersExportHTML", () => {
  it("should generate HTML with table", () => {
    const html = generateOrdersExportHTML(mockOrders);
    expect(html).toContain("<table>");
    expect(html).toContain("</table>");
    expect(html).toContain("<th>Order</th>");
  });

  it("should include order data", () => {
    const html = generateOrdersExportHTML(mockOrders);
    expect(html).toContain("DT-A1B2C3");
    expect(html).toContain("John Mwale");
    expect(html).toContain("Selma Amadhila");
  });

  it("should show total count", () => {
    const html = generateOrdersExportHTML(mockOrders);
    expect(html).toContain("Total: 2 orders");
  });

  it("should return empty state for empty orders", () => {
    const html = generateOrdersExportHTML([]);
    expect(html).toContain("Total: 0 orders");
    expect(html).toContain("<table>");
  });
});
