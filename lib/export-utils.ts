import { formatCents, getStatusLabel } from "./dashboard-data";
import type { DashboardOrder } from "./dashboard-data";

/**
 * Generates CSV content from orders data.
 * Returns the CSV string ready to be saved as a Blob.
 */
export function generateOrdersCSV(orders: DashboardOrder[]): string {
  const headers = ["Order", "Customer", "Phone", "Items", "Total", "Contact", "Payment", "Fulfillment", "Date"];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.customerName,
    o.customerPhone,
    o.itemCount.toString(),
    formatCents(o.subtotalCents),
    getStatusLabel(o.contactStatus),
    getStatusLabel(o.paymentStatus),
    getStatusLabel(o.fulfillmentStatus),
    new Date(o.createdAt).toLocaleDateString("en-US"),
  ]);
  return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
}

/**
 * Generates a complete HTML document string for order export.
 * Opens in a new window and can be printed to save as PDF.
 */
export function generateOrdersExportHTML(orders: DashboardOrder[]): string {
  const tableRows = orders
    .map(
      (o) => `
      <tr>
        <td>${o.orderNumber}</td>
        <td>${o.customerName}</td>
        <td>${o.customerPhone}</td>
        <td>${o.itemCount}</td>
        <td>${formatCents(o.subtotalCents)}</td>
        <td>${getStatusLabel(o.contactStatus)}</td>
        <td>${getStatusLabel(o.paymentStatus)}</td>
        <td>${getStatusLabel(o.fulfillmentStatus)}</td>
        <td>${new Date(o.createdAt).toLocaleDateString("en-US")}</td>
      </tr>`,
    )
    .join("");

  return `
    <html>
      <head>
        <title>Orders Export</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          p { color: #666; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
          th { background: #f5f5f5; font-weight: 600; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      </head>
      <body>
        <h1>Orders Export - ${new Date().toLocaleDateString("en-US")}</h1>
        <p>Total: ${orders.length} orders</p>
        <table>
          <thead>        <tr>
          <th>Order</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Contact</th><th>Payment</th><th>Fulfillment</th><th>Date</th>
        </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>`.trim();
}

/**
 * Triggers a browser download of the given CSV string as a file.
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens the given HTML string in a new window and triggers the browser print dialog.
 */
export function openHTMLForPrint(html: string): void {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
