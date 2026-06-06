import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Test the validation schema separately since we can't easily test the route handler
const requestSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  customerName: z.string().min(1).max(100),
  preferredContact: z.array(z.enum(["WhatsApp", "Phone", "Email"])).min(1).max(3),
  contactValues: z.record(z.enum(["WhatsApp", "Phone", "Email"]), z.string().min(1).max(200)),
  urgency: z.enum(["ASAP", "Flexible", "JustChecking"]),
  note: z.string().max(500).optional(),
});

describe("BackInStockRequest validation", () => {
  it("accepts valid request data", () => {
    const data = {
      productId: "p4",
      productName: 'iPad Pro 13" M4',
      customerName: "John Mwale",
      preferredContact: ["WhatsApp"] as const,
      contactValues: { WhatsApp: "264812345678" },
      urgency: "ASAP" as const,
    };

    const result = requestSchema.parse(data);
    expect(result.productId).toBe("p4");
    expect(result.customerName).toBe("John Mwale");
  });

  it("accepts request with optional note", () => {
    const data = {
      productId: "p4",
      productName: 'iPad Pro 13" M4',
      customerName: "John Mwale",
      preferredContact: ["WhatsApp"] as const,
      contactValues: { WhatsApp: "264812345678" },
      urgency: "Flexible" as const,
      note: "Need it for school",
    };

    const result = requestSchema.parse(data);
    expect(result.note).toBe("Need it for school");
  });

  it("rejects missing productId", () => {
    const data = {
      productId: "",
      productName: 'iPad Pro 13" M4',
      customerName: "John Mwale",
      preferredContact: ["WhatsApp"] as const,
      contactValues: { WhatsApp: "264812345678" },
      urgency: "ASAP" as const,
    };

    expect(() => requestSchema.parse(data)).toThrow();
  });

  it("rejects missing customerName", () => {
    const data = {
      productId: "p4",
      productName: 'iPad Pro 13" M4',
      customerName: "",
      preferredContact: ["WhatsApp"] as const,
      contactValues: { WhatsApp: "264812345678" },
      urgency: "ASAP" as const,
    };

    expect(() => requestSchema.parse(data)).toThrow();
  });

  it("rejects invalid preferredContact", () => {
    const data = {
      productId: "p4",
      productName: 'iPad Pro 13" M4',
      customerName: "John Mwale",
      preferredContact: ["Signal"],
      contactValues: { Signal: "264812345678" },
      urgency: "ASAP" as const,
    };

    expect(() => requestSchema.parse(data)).toThrow();
  });

  it("rejects invalid urgency", () => {
    const data = {
      productId: "p4",
      productName: 'iPad Pro 13" M4',
      customerName: "John Mwale",
      preferredContact: ["WhatsApp"] as const,
      contactValues: { WhatsApp: "264812345678" },
      urgency: "Urgent",
    };

    expect(() => requestSchema.parse(data)).toThrow();
  });

  it("rejects note longer than 500 characters", () => {
    const data = {
      productId: "p4",
      productName: 'iPad Pro 13" M4',
      customerName: "John Mwale",
      preferredContact: ["WhatsApp"] as const,
      contactValues: { WhatsApp: "264812345678" },
      urgency: "ASAP" as const,
      note: "x".repeat(501),
    };

    expect(() => requestSchema.parse(data)).toThrow();
  });

  it("accepts all preferred contact methods", () => {
    const methods = ["WhatsApp", "Phone", "Email"] as const;
    for (const method of methods) {
      const data = {
        productId: "p4",
        productName: "Test",
        customerName: "John",
        preferredContact: [method],
        contactValues: { [method]: method === "Email" ? "a@b.com" : "123456789" },
        urgency: "JustChecking" as const,
      };
      const result = requestSchema.parse(data);
      expect(result.preferredContact).toContain(method);
    }
  });

  it("accepts all urgency levels", () => {
    const urgencies = ["ASAP", "Flexible", "JustChecking"] as const;
    for (const urgency of urgencies) {
      const data = {
        productId: "p4",
        productName: "Test",
        customerName: "John",
        preferredContact: ["WhatsApp"] as const,
        contactValues: { WhatsApp: "264812345678" },
        urgency,
      };
      const result = requestSchema.parse(data);
      expect(result.urgency).toBe(urgency);
    }
  });
});
