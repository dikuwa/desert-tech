/**
 * PDF Receipt template rendered with @react-pdf/renderer.
 */
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica", fontWeight: "normal" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const colors = {
  primary: "#f68923",
  text: "#1a1a2e",
  muted: "#6b7280",
  border: "#e5e7eb",
  success: "#15803D",
};

const logoPath = path.join(process.cwd(), "public", "images", "desertech-doc-logo.png");
const logoDataUri = `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: `1px solid ${colors.border}`,
  },
  logo: {
    width: 190,
    height: 58,
    objectFit: "contain" as const,
  },
  companyDetails: {
    marginTop: 3,
    width: 190,
  },
  companyDetailText: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
    textAlign: "right" as const,
  },
  receiptBadge: {
    backgroundColor: colors.primary,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center" as const,
  },
  receiptNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: 80,
    color: colors.muted,
    fontSize: 9,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    color: colors.text,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottom: `1px solid ${colors.border}`,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.muted,
    textTransform: "uppercase" as const,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${colors.border}`,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    color: colors.text,
  },
  colDescription: { width: "40%" },
  colQty: { width: "15%", textAlign: "center" as const },
  colPrice: { width: "20%", textAlign: "right" as const },
  colTotal: { width: "25%", textAlign: "right" as const },
  totalsSection: {
    marginTop: 16,
    marginLeft: "auto",
    width: "50%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  totalValue: {
    fontSize: 9,
    color: colors.text,
    fontWeight: "bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `2px solid ${colors.text}`,
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  paymentBadge: {
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center" as const,
  },
  paymentPaid: {
    backgroundColor: "#E8F7EE",
    color: colors.success,
  },
  paymentUnpaid: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
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
  storeLocation?: string;
  storePhone?: string;
}

function formatCurrency(cents: number): string {
  return `N$ ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
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
  storeLocation = "Windhoek, Namibia",
  storePhone = "+264 85 277 5140",
}: ReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Image src={logoDataUri} style={styles.logo} />
            <View style={styles.companyDetails}>
              <Text style={styles.companyDetailText}>{storeLocation}, {storePhone}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.receiptBadge}>RECEIPT</Text>
            <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order #</Text>
            <Text style={styles.infoValue}>{orderNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{customerPhone}</Text>
          </View>
          {customerEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{customerEmail}</Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>
            {items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDescription]}>{item.name}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Collection</Text>
            <Text style={{ ...styles.totalValue, color: colors.success }}>Free</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(subtotal)}</Text>
          </View>

          {/* Payment Status */}
          <View style={[styles.paymentBadge, paymentStatus === "Paid" ? styles.paymentPaid : styles.paymentUnpaid]}>
            <Text>{paymentStatus === "Paid" ? "PAID" : "PENDING PAYMENT"}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {receiptNumber} | {date}
          </Text>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
}
