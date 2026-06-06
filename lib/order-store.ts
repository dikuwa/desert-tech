/**
 * In-memory order store for development/demo.
 * When the database is not available, orders are stored here
 * and can be retrieved by the dashboard and success pages.
 */

export interface StoredOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  subtotalCents: number;
  contactStatus: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  preferredContact: string;
  notes?: string;
  items: { name: string; quantity: number; priceCents: number }[];
  createdAt: string;
}

const orders: StoredOrder[] = [];

export function addOrder(order: StoredOrder): void {
  orders.unshift(order);
}

export function getOrders(): StoredOrder[] {
  return [...orders];
}

export function getOrderByNumber(orderNumber: string): StoredOrder | undefined {
  return orders.find((o) => o.orderNumber === orderNumber);
}
