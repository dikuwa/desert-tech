import { describe, it, expect, beforeEach } from "vitest";
import {
  addBackInStockRequest,
  getBackInStockRequests,
  getBackInStockRequestById,
  updateBackInStockRequestStatus,
  deleteBackInStockRequest,
  getRequestsByProductId,
  markRequestsReadyForProduct,
  findDuplicateRequest,
  getOpenRequestCountByProduct,
} from "./back-in-stock-store";

beforeEach(() => {
  // Clear the in-memory store between tests
  const all = getBackInStockRequests();
  all.forEach((r) => deleteBackInStockRequest(r.id));
});

const sampleRequest = {
  productId: "p1",
  productName: "Test Product",
  customerName: "John Doe",
  preferredContact: ["WhatsApp"] as ("WhatsApp" | "Phone" | "Email")[],
  contactValue: "264811234567",
  contactValues: { WhatsApp: "264811234567" },
  urgency: "ASAP" as const,
  note: "Need it soon",
};

describe("addBackInStockRequest", () => {
  it("should add a request with status New", () => {
    const req = addBackInStockRequest(sampleRequest);
    expect(req.id).toBeDefined();
    expect(req.status).toBe("New");
    expect(req.customerName).toBe("John Doe");
    expect(req.productName).toBe("Test Product");
    expect(req.createdAt).toBeDefined();
    expect(req.updatedAt).toBeDefined();
  });

  it("should prepend to the list", () => {
    addBackInStockRequest(sampleRequest);
    const req2 = addBackInStockRequest({
      ...sampleRequest,
      customerName: "Jane Doe",
    });
    const all = getBackInStockRequests();
    expect(all[0].customerName).toBe("Jane Doe");
    expect(all.length).toBe(2);
  });

  it("should handle optional note", () => {
    const req = addBackInStockRequest({ ...sampleRequest, note: undefined });
    expect(req.note).toBeUndefined();
  });
});

describe("getBackInStockRequests", () => {
  it("should return all requests", () => {
    expect(getBackInStockRequests()).toHaveLength(0);
    addBackInStockRequest(sampleRequest);
    addBackInStockRequest({ ...sampleRequest, customerName: "Jane Doe" });
    expect(getBackInStockRequests()).toHaveLength(2);
  });

  it("should return a copy of the array", () => {
    addBackInStockRequest(sampleRequest);
    const all = getBackInStockRequests();
    all.pop();
    expect(getBackInStockRequests()).toHaveLength(1);
  });
});

describe("getBackInStockRequestById", () => {
  it("should find a request by id", () => {
    const req = addBackInStockRequest(sampleRequest);
    const found = getBackInStockRequestById(req.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(req.id);
  });

  it("should return undefined for non-existent id", () => {
    expect(getBackInStockRequestById("nonexistent")).toBeUndefined();
  });
});

describe("updateBackInStockRequestStatus", () => {
  it("should update the status", async () => {
    const req = addBackInStockRequest(sampleRequest);
    // Small delay so timestamps differ
    await new Promise((r) => setTimeout(r, 5));
    const updated = updateBackInStockRequestStatus(req.id, "ReadyToContact");
    expect(updated).toBeDefined();
    expect(updated?.status).toBe("ReadyToContact");
    expect(updated?.updatedAt).not.toBe(req.updatedAt);
  });

  it("should return undefined for non-existent id", () => {
    expect(updateBackInStockRequestStatus("nonexistent", "Contacted")).toBeUndefined();
  });

  it("should persist the update in the store", () => {
    const req = addBackInStockRequest(sampleRequest);
    updateBackInStockRequestStatus(req.id, "Cancelled");
    const found = getBackInStockRequestById(req.id);
    expect(found?.status).toBe("Cancelled");
  });
});

describe("deleteBackInStockRequest", () => {
  it("should delete a request", () => {
    const req = addBackInStockRequest(sampleRequest);
    expect(getBackInStockRequests()).toHaveLength(1);
    const deleted = deleteBackInStockRequest(req.id);
    expect(deleted).toBe(true);
    expect(getBackInStockRequests()).toHaveLength(0);
  });

  it("should return false for non-existent id", () => {
    expect(deleteBackInStockRequest("nonexistent")).toBe(false);
  });
});

describe("getRequestsByProductId", () => {
  it("should return open requests for a product", () => {
    addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    addBackInStockRequest({ ...sampleRequest, productId: "p2" });
    const p1Requests = getRequestsByProductId("p1");
    expect(p1Requests).toHaveLength(2);
  });

  it("should only return New or ReadyToContact requests", () => {
    const req = addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    updateBackInStockRequestStatus(req.id, "Contacted");
    const p1Requests = getRequestsByProductId("p1");
    expect(p1Requests).toHaveLength(0);
  });
});

describe("markRequestsReadyForProduct", () => {
  it("should mark all New requests as ReadyToContact", () => {
    addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    addBackInStockRequest({ ...sampleRequest, productId: "p1", customerName: "Jane" });
    addBackInStockRequest({ ...sampleRequest, productId: "p2" });

    const updated = markRequestsReadyForProduct("p1", "Test Product");
    expect(updated).toHaveLength(2);

    const all = getBackInStockRequests();
    const p1New = all.filter(
      (r) => r.productId === "p1" && r.status === "ReadyToContact",
    );
    expect(p1New).toHaveLength(2);
  });

  it("should not affect Already Contacted or Cancelled requests", () => {
    const req = addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    updateBackInStockRequestStatus(req.id, "Contacted");
    addBackInStockRequest({ ...sampleRequest, productId: "p1", customerName: "Jane" });

    const updated = markRequestsReadyForProduct("p1", "Test Product");
    expect(updated).toHaveLength(1);

    const contacted = getBackInStockRequestById(req.id);
    expect(contacted?.status).toBe("Contacted");
  });

  it("should return empty array when no requests match", () => {
    const updated = markRequestsReadyForProduct("nonexistent", "Test");
    expect(updated).toHaveLength(0);
  });
});

describe("findDuplicateRequest", () => {
  it("should find a duplicate by productId and contactValue", () => {
    addBackInStockRequest(sampleRequest);
    const duplicate = findDuplicateRequest("p1", "264811234567");
    expect(duplicate).toBeDefined();
    expect(duplicate?.customerName).toBe("John Doe");
  });

  it("should be case-insensitive for contactValue", () => {
    addBackInStockRequest(sampleRequest);
    const duplicate = findDuplicateRequest("p1", "264811234567");
    expect(duplicate).toBeDefined();
  });

  it("should only match non-contacted requests", () => {
    const req = addBackInStockRequest(sampleRequest);
    updateBackInStockRequestStatus(req.id, "Contacted");
    const duplicate = findDuplicateRequest("p1", "264811234567");
    expect(duplicate).toBeUndefined();
  });

  it("should return undefined for different product", () => {
    addBackInStockRequest(sampleRequest);
    const duplicate = findDuplicateRequest("p2", "264811234567");
    expect(duplicate).toBeUndefined();
  });
});

describe("getOpenRequestCountByProduct", () => {
  it("should count open requests for a product", () => {
    addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    addBackInStockRequest({ ...sampleRequest, productId: "p2" });
    expect(getOpenRequestCountByProduct("p1")).toBe(2);
    expect(getOpenRequestCountByProduct("p2")).toBe(1);
  });

  it("should not count contacted or cancelled requests", () => {
    const req = addBackInStockRequest({ ...sampleRequest, productId: "p1" });
    updateBackInStockRequestStatus(req.id, "Cancelled");
    expect(getOpenRequestCountByProduct("p1")).toBe(0);
  });
});
