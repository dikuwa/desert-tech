/**
 * In-memory back-in-stock request store for development/demo.
 * When the database is not available, requests are stored here
 * and can be retrieved by the dashboard.
 */

export interface StoredBackInStockRequest {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  preferredContact: ("WhatsApp" | "Phone" | "Email")[];
  contactValue: string;
  contactValues?: Partial<Record<"WhatsApp" | "Phone" | "Email", string>>;
  urgency: "ASAP" | "Flexible" | "JustChecking";
  note?: string;
  status: "New" | "ReadyToContact" | "Contacted" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

const requests: StoredBackInStockRequest[] = [];
let nextId = 1;

export function addBackInStockRequest(
  data: Omit<StoredBackInStockRequest, "id" | "status" | "createdAt" | "updatedAt">,
): StoredBackInStockRequest {
  const now = new Date().toISOString();
  const request: StoredBackInStockRequest = {
    ...data,
    id: `bis_${nextId++}`,
    status: "New",
    createdAt: now,
    updatedAt: now,
  };
  requests.unshift(request);
  return request;
}

export function getBackInStockRequests(): StoredBackInStockRequest[] {
  return [...requests];
}

export function getBackInStockRequestById(id: string): StoredBackInStockRequest | undefined {
  return requests.find((r) => r.id === id);
}

export function updateBackInStockRequestStatus(
  id: string,
  status: StoredBackInStockRequest["status"],
): StoredBackInStockRequest | undefined {
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  requests[idx] = {
    ...requests[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  return requests[idx];
}

export function deleteBackInStockRequest(id: string): boolean {
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  requests.splice(idx, 1);
  return true;
}

export function getRequestsByProductId(productId: string): StoredBackInStockRequest[] {
  return requests.filter(
    (r) => r.productId === productId && (r.status === "New" || r.status === "ReadyToContact"),
  );
}

export function markRequestsReadyForProduct(
  productId: string,
  productName: string,
): StoredBackInStockRequest[] {
  const updated: StoredBackInStockRequest[] = [];
  const now = new Date().toISOString();
  for (let i = 0; i < requests.length; i++) {
    if (requests[i].productId === productId && requests[i].status === "New") {
      requests[i] = {
        ...requests[i],
        status: "ReadyToContact",
        updatedAt: now,
      };
      updated.push(requests[i]);
    }
  }
  return updated;
}

export function findDuplicateRequest(
  productId: string,
  contactValue: string,
): StoredBackInStockRequest | undefined {
  return requests.find(
    (r) =>
      r.productId === productId &&
      r.contactValue.toLowerCase() === contactValue.toLowerCase() &&
      (r.status === "New" || r.status === "ReadyToContact"),
  );
}

export function getOpenRequestCountByProduct(productId: string): number {
  return requests.filter(
    (r) =>
      r.productId === productId &&
      (r.status === "New" || r.status === "ReadyToContact"),
  ).length;
}
