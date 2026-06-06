import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";

// Helvetica is a standard PDF font — no need to register it.
// @react-pdf/renderer includes it by default.

const colors = {
  primary: "#f68923",
  text: "#1a1a2e",
  muted: "#6b7280",
  border: "#d9dce1",
  surface: "#f6f7f8",
  success: "#15803d",
  warning: "#d97706",
};

// Load the receipt icon — fall back gracefully if the file is missing
let iconDataUri: string | null = null;
try {
  const iconPath = path.join(process.cwd(), "public", "images", "receipt-icon.svg");
  iconDataUri = `data:image/svg+xml;base64,${readFileSync(iconPath).toString("base64")}`;
} catch {
  // Icon is not critical for PDF rendering
  iconDataUri = null;
}

const styles = StyleSheet.create({
  page: {
    padding: 26,
    paddingTop: 22,
    paddingBottom: 22,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.text,
    backgroundColor: "#ffffff",
  },
  document: {
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottom: `1px solid ${colors.border}`,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottom: `1px solid ${colors.border}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: { flexDirection: "row", alignItems: "flex-start" },
  logo: { width: 38, height: 38, objectFit: "contain", marginRight: 10 },
  companyName: { fontSize: 13, fontWeight: "bold", marginBottom: 3 },
  companyLine: { fontSize: 8, color: colors.muted, marginBottom: 2 },
  badge: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    color: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 8,
    fontWeight: "bold",
  },
  receiptNumber: { marginTop: 7, fontSize: 11, fontWeight: "bold", textAlign: "right" },
  infoGrid: { flexDirection: "row" },
  infoColumn: { flex: 1 },
  label: {
    fontSize: 7,
    fontWeight: "bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: { fontSize: 9, fontWeight: "bold" },
  customerName: { fontSize: 10, fontWeight: "bold", marginBottom: 3 },
  customerLine: { fontSize: 8, color: colors.muted, marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 6,
    borderBottom: `1px solid ${colors.border}`,
  },
  tableRow: { flexDirection: "row", paddingVertical: 8 },
  headerText: {
    fontSize: 7,
    fontWeight: "bold",
    color: colors.muted,
    textTransform: "uppercase",
  },
  cell: { fontSize: 9 },
  description: { width: "52%" },
  qty: { width: "12%", textAlign: "center" },
  price: { width: "18%", textAlign: "right" },
  total: { width: "18%", textAlign: "right", fontWeight: "bold" },
  totals: { width: 220, marginLeft: "auto" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 9, color: colors.muted },
  totalValue: { fontSize: 9, fontWeight: "bold" },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 7,
    marginTop: 3,
  },
  grandText: { fontSize: 12, fontWeight: "bold" },
  paymentSummary: { flexDirection: "row" },
  paymentBox: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 11,
    marginRight: 8,
  },
  paymentBoxLast: { marginRight: 0 },
  paymentValue: { fontSize: 13, fontWeight: "bold", marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingVertical: 10, textAlign: "center" },
  footerText: { fontSize: 7, color: colors.muted, marginBottom: 2 },
});

interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptPDFProps {
  receiptNumber: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: ReceiptItem[];
  subtotal: number;
  paymentStatus: string;
  totalPaidCents?: number;
  balanceDueCents?: number;
  storeLocation?: string;
  storePhone?: string;
  fulfillmentMethod?: "collection" | "courier";
  courierFeeCents?: number;
  shipping?: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    deliveryNotes?: string;
  };
}

function formatCurrency(cents: number): string {
  return `N$ ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function paymentLabel(status: string): string {
  if (status === "PaidInFull" || status === "Paid") return "Paid in Full";
  if (status === "DepositPaid") return "Deposit Paid";
  return "Awaiting Payment";
}

export function ReceiptPDF({
  receiptNumber,
  orderNumber,
  date,
  customerName,
  customerPhone,
  customerEmail,
  items,
  subtotal,
  paymentStatus,
  totalPaidCents = 0,
  balanceDueCents = 0,
  storeLocation = "Windhoek, Namibia",
  storePhone = "+264 85 277 5140",
  fulfillmentMethod,
  courierFeeCents,
  shipping,
}: ReceiptPDFProps) {
  const statusLabel = paymentLabel(paymentStatus);
  const settled = paymentStatus === "PaidInFull" || paymentStatus === "Paid";
  const totalCents = subtotal + (fulfillmentMethod === "courier" && courierFeeCents ? courierFeeCents : 0);
  const showBalance = !settled && paymentStatus !== "Unpaid" && balanceDueCents > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.document}>
          <View style={styles.header}>
            <View style={styles.brand}>
              {iconDataUri && <Image src={iconDataUri} style={styles.logo} />}
              <View>
                <Text style={styles.companyName}>Desert Technology Consultant</Text>
                <Text style={styles.companyLine}>{storeLocation}</Text>
                <Text style={styles.companyLine}>{storePhone}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.badge}>RECEIPT</Text>
              <Text style={styles.receiptNumber}>{receiptNumber}</Text>
            </View>
          </View>

          <View style={[styles.section, styles.infoGrid]}>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Order #</Text>
              <Text style={styles.value}>{orderNumber}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{date}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.label}>Payment</Text>
              <Text style={[styles.value, { color: settled ? colors.success : colors.warning }]}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.customerLine}>{customerPhone}</Text>
            {customerEmail && <Text style={styles.customerLine}>{customerEmail}</Text>}
            {shipping && (
              <View style={{ marginTop: 6 }}>
                <Text style={[styles.label, { marginBottom: 3 }]}>Shipping Address</Text>
                <Text style={[styles.customerLine, { marginBottom: 1 }]}>{shipping.recipientName}</Text>
                <Text style={styles.customerLine}>{shipping.phone}</Text>
                <Text style={styles.customerLine}>{shipping.address}</Text>
                <Text style={styles.customerLine}>{shipping.city}, {shipping.region}</Text>
                {shipping.deliveryNotes && <Text style={styles.customerLine}>Note: {shipping.deliveryNotes}</Text>}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { marginBottom: 10 }]}>Items</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.description]}>Description</Text>
              <Text style={[styles.headerText, styles.qty]}>Qty</Text>
              <Text style={[styles.headerText, styles.price]}>Unit Price</Text>
              <Text style={[styles.headerText, styles.total]}>Total</Text>
            </View>
            {items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.tableRow}>
                <Text style={[styles.cell, styles.description]}>{item.name}</Text>
                <Text style={[styles.cell, styles.qty]}>{item.quantity}</Text>
                <Text style={[styles.cell, styles.price]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.cell, styles.total]}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
              </View>
              {fulfillmentMethod === "courier" && courierFeeCents ? (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Courier Fee</Text>
                  <Text style={styles.totalValue}>{formatCurrency(courierFeeCents)}</Text>
                </View>
              ) : (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Collection</Text>
                  <Text style={[styles.totalValue, { color: colors.success }]}>Free</Text>
                </View>
              )}
              <View style={styles.grandTotal}>
                <Text style={styles.grandText}>Total</Text>
                <Text style={[styles.grandText, { color: colors.primary }]}>{formatCurrency(totalCents)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { marginBottom: 9 }]}>Payment Summary</Text>
            <View style={styles.paymentSummary}>
              <View style={styles.paymentBox}>
                <Text style={[styles.label, { color: settled ? colors.success : colors.warning }]}>Status</Text>
                <Text style={[styles.paymentValue, { color: settled ? colors.success : colors.warning }]}>{statusLabel}</Text>
              </View>
              <View style={styles.paymentBox}>
                <Text style={styles.label}>Order Total</Text>
                <Text style={[styles.paymentValue, { color: colors.primary }]}>{formatCurrency(totalCents)}</Text>
              </View>
              <View style={styles.paymentBox}>
                <Text style={styles.label}>Paid</Text>
                <Text style={[styles.paymentValue, { color: settled ? colors.success : colors.primary }]}>{formatCurrency(totalPaidCents)}</Text>
              </View>
              <View style={[styles.paymentBox, styles.paymentBoxLast]}>
                <Text style={[styles.label, { color: showBalance ? colors.warning : colors.success }]}>Balance</Text>
                <Text style={[styles.paymentValue, { color: showBalance ? colors.warning : colors.success }]}>
                  {showBalance ? formatCurrency(balanceDueCents) : settled ? "N$ 0" : formatCurrency(subtotal)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Desert Technology Consultant - {storeLocation}</Text>
            <Text style={styles.footerText}>sales@desertechnam.com - {storePhone}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
