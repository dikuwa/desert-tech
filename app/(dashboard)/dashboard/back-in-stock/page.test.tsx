import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BackInStockPage from "./page";

// Mock the dashboard store
const mockBackInStockRequests = [
  {
    id: "b1",
    productId: "p4",
    productName: 'iPad Pro 13" M4',
    customerName: "Helena Ndapanda",
    preferredContact: ["WhatsApp"] as ("WhatsApp" | "Phone" | "Email")[],
    contactValue: "264811234567",
    contactValues: { WhatsApp: "264811234567" },
    urgency: "ASAP" as const,
    note: "Need for school, starting next week",
    status: "New" as const,
    createdAt: "2026-06-02T09:00:00Z",
    updatedAt: "2026-06-02T09:00:00Z",
  },
  {
    id: "b2",
    productId: "p4",
    productName: 'iPad Pro 13" M4',
    customerName: "Tomas Shikongo",
    preferredContact: ["Email"] as ("WhatsApp" | "Phone" | "Email")[],
    contactValue: "tomas@example.com",
    contactValues: { Email: "tomas@example.com" },
    urgency: "Flexible" as const,
    status: "New" as const,
    createdAt: "2026-06-01T14:30:00Z",
    updatedAt: "2026-06-01T14:30:00Z",
  },
  {
    id: "b3",
    productId: "p13",
    productName: "iPhone 16 Pro Max",
    customerName: "Maria Kambonde",
    preferredContact: ["Phone"] as ("WhatsApp" | "Phone" | "Email")[],
    contactValue: "264852345678",
    contactValues: { Phone: "264852345678" },
    urgency: "JustChecking" as const,
    status: "ReadyToContact" as const,
    createdAt: "2026-05-28T11:00:00Z",
    updatedAt: "2026-06-02T08:00:00Z",
  },
];

vi.mock("@/lib/store/dashboard", () => ({
  useDashboardStore: (selector: (state: any) => any) =>
    selector({
      backInStockRequests: mockBackInStockRequests,
      updateBackInStockStatus: vi.fn(),
      deleteBackInStockRequest: vi.fn(),
    }),
}));

describe("BackInStockPage", () => {
  it("renders the page title", () => {
    render(<BackInStockPage />);
    expect(screen.getByText("Stock Notification Requests")).toBeDefined();
  });

  it("shows the total request count", () => {
    render(<BackInStockPage />);
    expect(screen.getByText(/3 requests?/)).toBeDefined();
  });

  it("renders all customer names", () => {
    render(<BackInStockPage />);
    expect(screen.getByText("Helena Ndapanda")).toBeDefined();
    expect(screen.getByText("Tomas Shikongo")).toBeDefined();
    expect(screen.getByText("Maria Kambonde")).toBeDefined();
  });

  it("renders product names", () => {
    render(<BackInStockPage />);
    expect(screen.getAllByText(/iPad Pro/).length).toBeGreaterThan(0);
    expect(screen.getByText("iPhone 16 Pro Max")).toBeDefined();
  });

  it("renders urgency labels", () => {
    render(<BackInStockPage />);
    // These labels appear in both the filter dropdown and table rows
    expect(screen.getAllByText("ASAP").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Flexible").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Just Checking").length).toBeGreaterThanOrEqual(1);
  });

  it("renders status labels", () => {
    render(<BackInStockPage />);
    // "Ready to Contact" appears in filter dropdown and table row
    expect(screen.getAllByText("Ready to Contact").length).toBeGreaterThanOrEqual(1);
  });

  it("renders status filter dropdown", () => {
    render(<BackInStockPage />);
    expect(screen.getByText("All Status")).toBeDefined();
  });

  it("renders urgency filter dropdown", () => {
    render(<BackInStockPage />);
    expect(screen.getByText("All Urgency")).toBeDefined();
  });

  it("shows note for requests that have one", () => {
    render(<BackInStockPage />);
    expect(
      screen.getByText("Need for school, starting next week"),
    ).toBeDefined();
  });

  it("renders search input", () => {
    render(<BackInStockPage />);
    expect(
      screen.getByPlaceholderText("Search customer, product, or contact..."),
    ).toBeDefined();
  });
});
