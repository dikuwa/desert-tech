import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotifyMeModal } from "./notify-me-modal";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const defaultProps = {
  productId: "p4",
  productName: 'iPad Pro 13" M4',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NotifyMeModal", () => {
  it("renders the trigger button with correct text", () => {
    render(<NotifyMeModal {...defaultProps} />);
    expect(screen.getByText("Notify Me")).toBeDefined();
  });

  it("opens the dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    expect(screen.getByText(/Let us know when/)).toBeDefined();
    expect(screen.getByLabelText("Your Name *")).toBeDefined();
  });

  it("shows the product name in the dialog", async () => {
    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    expect(screen.getByText(/iPad Pro/)).toBeDefined();
  });

  it("shows validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    await user.click(screen.getByTestId("notify-submit"));

    expect(screen.getByText("Name is required")).toBeDefined();
  });

  it("validates email format when Email is selected", async () => {
    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));

    await user.click(screen.getByRole("button", { name: "WhatsApp" }));
    await user.click(screen.getByRole("button", { name: "Email" }));

    const emailInput = screen.getByLabelText("Email Address *");
    await user.type(emailInput, "not-an-email");

    const nameInput = screen.getByLabelText("Your Name *");
    await user.type(nameInput, "John Doe");

    await user.click(screen.getByTestId("notify-submit"));
    expect(screen.getByText("Enter a valid email address")).toBeDefined();
  });

  it("submits the form successfully and shows success state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "We'll notify you when this item is available." }),
    });

    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    await user.type(screen.getByLabelText("Your Name *"), "John Mwale");
    await user.type(screen.getByLabelText("WhatsApp Number *"), "264812345678");
    await user.click(screen.getByTestId("notify-submit"));

    await waitFor(() => {
      expect(screen.getByText("You're on the list!")).toBeDefined();
    });
  });

  it("submits more than one preferred contact method", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    await user.click(screen.getByRole("button", { name: "Email" }));
    await user.type(screen.getByLabelText("Your Name *"), "John Mwale");
    await user.type(screen.getByLabelText("WhatsApp Number *"), "264812345678");
    await user.type(screen.getByLabelText("Email Address *"), "john@example.com");
    await user.click(screen.getByTestId("notify-submit"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/back-in-stock-requests",
        expect.objectContaining({
          body: expect.any(String),
        }),
      );
    });

    const request = mockFetch.mock.calls[0][1];
    expect(JSON.parse(request.body)).toMatchObject({
      preferredContact: ["WhatsApp", "Email"],
      contactValues: {
        WhatsApp: "264812345678",
        Email: "john@example.com",
      },
    });
  });

  it("handles duplicate request gracefully", async () => {
    // Duplicate path triggers when res.ok is false and data.duplicate is true
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: true,
        duplicate: true,
        message: "You've already requested this item.",
      }),
    });

    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    await user.type(screen.getByLabelText("Your Name *"), "John Mwale");
    await user.type(screen.getByLabelText("WhatsApp Number *"), "264812345678");
    await user.click(screen.getByTestId("notify-submit"));

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        "You've already requested this item. We'll let you know when it's back!",
      );
    });
  });

  it("handles API error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const { toast } = await import("sonner");

    const user = userEvent.setup();
    render(<NotifyMeModal {...defaultProps} />);

    await user.click(screen.getByText("Notify Me"));
    await user.type(screen.getByLabelText("Your Name *"), "John Mwale");
    await user.type(screen.getByLabelText("WhatsApp Number *"), "264812345678");
    await user.click(screen.getByTestId("notify-submit"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
