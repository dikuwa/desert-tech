import { describe, it, expect, beforeEach } from "vitest";
import { useWishlist, type WishlistItem } from "./wishlist";

const sampleItem: WishlistItem = {
  productId: "p1",
  name: "MacBook Air M4",
  slug: "macbook-air-m4",
  imageUrl: "/images/macbook.jpg",
  priceCents: 2499900,
  specs: 'Apple M4, 16GB RAM, 512GB SSD, 13.6" Display',
};

const sampleItem2: WishlistItem = {
  productId: "p2",
  name: "iPad Pro 13\" M4",
  slug: "ipad-pro-m4",
  imageUrl: "/images/ipad.jpg",
  priceCents: 1999900,
  specs: 'Apple M4, 8GB RAM, 256GB SSD, 13" Display',
};

function resetStore() {
  useWishlist.setState({ items: [] });
}

describe("Wishlist Store", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("addItem", () => {
    it("should add a new item to the wishlist", () => {
      useWishlist.getState().addItem(sampleItem);
      const items = useWishlist.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("p1");
      expect(items[0].name).toBe("MacBook Air M4");
    });

    it("should not add a duplicate item", () => {
      useWishlist.getState().addItem(sampleItem);
      useWishlist.getState().addItem(sampleItem);
      const items = useWishlist.getState().items;
      expect(items).toHaveLength(1);
    });
  });

  describe("removeItem", () => {
    it("should remove an item by productId", () => {
      useWishlist.getState().addItem(sampleItem);
      useWishlist.getState().addItem(sampleItem2);
      useWishlist.getState().removeItem("p1");

      const items = useWishlist.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("p2");
    });

    it("should do nothing when removing a non-existent item", () => {
      useWishlist.getState().addItem(sampleItem);
      useWishlist.getState().removeItem("non-existent");
      expect(useWishlist.getState().items).toHaveLength(1);
    });
  });

  describe("toggleItem", () => {
    it("should add an item that does not exist", () => {
      useWishlist.getState().toggleItem(sampleItem);
      expect(useWishlist.getState().items).toHaveLength(1);
    });

    it("should remove an item that already exists", () => {
      useWishlist.getState().addItem(sampleItem);
      useWishlist.getState().toggleItem(sampleItem);
      expect(useWishlist.getState().items).toHaveLength(0);
    });
  });

  describe("isWishlisted", () => {
    it("should return true for wishlisted items", () => {
      useWishlist.getState().addItem(sampleItem);
      expect(useWishlist.getState().isWishlisted("p1")).toBe(true);
    });

    it("should return false for non-wishlisted items", () => {
      expect(useWishlist.getState().isWishlisted("non-existent")).toBe(false);
    });
  });

  describe("clearWishlist", () => {
    it("should clear all items", () => {
      useWishlist.getState().addItem(sampleItem);
      useWishlist.getState().addItem(sampleItem2);
      useWishlist.getState().clearWishlist();
      expect(useWishlist.getState().items).toHaveLength(0);
    });
  });

  describe("getItemCount", () => {
    it("should return 0 for an empty wishlist", () => {
      expect(useWishlist.getState().getItemCount()).toBe(0);
    });

    it("should return the correct count", () => {
      useWishlist.getState().addItem(sampleItem);
      useWishlist.getState().addItem(sampleItem2);
      expect(useWishlist.getState().getItemCount()).toBe(2);
    });
  });
});
