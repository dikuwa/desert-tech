/**
 * In-memory receipt store for development/demo.
 * Tracks generated receipts so they can be listed on the receipts page.
 * When the database is available, this will use Prisma instead.
 */

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  orderNumber: string;
  customerName: string;
  pdfUrl?: string;
  sentVia: "Email" | "WhatsApp" | "Manual" | "NotSent";
  sentAt?: string;
  issuedAt: string;
}

const receipts: ReceiptRecord[] = [];
let nextReceiptId = 1;

export function addReceipt(record: Omit<ReceiptRecord, "id">): ReceiptRecord {
  const id = `rcpt-${nextReceiptId++}`;
  const newRecord = { ...record, id };
  receipts.unshift(newRecord);
  return newRecord;
}

export function getReceipts(): ReceiptRecord[] {
  return [...receipts];
}

export function getReceiptByOrderNumber(orderNumber: string): ReceiptRecord | undefined {
  return receipts.find((r) => r.orderNumber === orderNumber);
}

export function updateReceiptSentStatus(
  orderNumber: string,
  sentVia: ReceiptRecord["sentVia"],
): void {
  const receipt = receipts.find((r) => r.orderNumber === orderNumber);
  if (receipt) {
    receipt.sentVia = sentVia;
    receipt.sentAt = new Date().toISOString();
  }
}
