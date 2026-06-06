import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface BackInStockNotificationProps {
  customerName: string;
  productName: string;
  productUrl?: string;
  storeName?: string;
  storePhone?: string;
  storeEmail?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function BackInStockNotification({
  customerName,
  productName,
  productUrl,
  storeName = "Desert Technology Consultant",
  storePhone = "+264 85 277 5140",
  storeEmail = "sales@desertechnam.com",
}: BackInStockNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Good news — {productName} is back in stock at {storeName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/desertech-doc-logo.svg`}
              alt={storeName}
              width="180"
              height="54"
              style={logo}
            />
            <Text style={tagline}>Namibia&rsquo;s trusted tech supplier</Text>
          </Section>

          <Heading style={h1}>Back in Stock!</Heading>

          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Great news! The{" "}
            <strong style={{ color: "#1a1a2e" }}>{productName}</strong> you
            requested is now back in stock at{" "}
            <strong>{storeName}</strong>.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>Product Available</Text>
            <Text style={productNameStyle}>{productName}</Text>
            <Text style={detailsText}>
              We now have stock available. Visit our store or contact us to
              purchase or arrange delivery.
            </Text>
          </Section>

          {productUrl && (
            <Section style={ctaSection}>
              <Button href={productUrl} style={button}>
                View Product
              </Button>
            </Section>
          )}

          <Text style={paragraph}>
            If you&apos;d like us to hold one for you, simply reply to this
            email or contact us on WhatsApp and we&apos;ll set it aside.
          </Text>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              {storeName}
              <br />
              {storePhone}
              <br />
              {storeEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "520px",
  padding: "40px 32px",
};

const header = {
  marginBottom: 24,
  textAlign: "center" as const,
};

const logo = {
  display: "block",
  height: "54px",
  margin: "0 auto",
  objectFit: "contain" as const,
  width: "180px",
};

const tagline = {
  fontSize: 12,
  color: "#f68923",
  margin: "4px 0 0 0",
  fontWeight: 600,
};

const h1 = {
  color: "#25a65b",
  fontSize: 24,
  fontWeight: 700,
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#4b5563",
  fontSize: 14,
  lineHeight: "22px",
  margin: "0 0 16px",
};

const detailsBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: 8,
  border: "1px solid #bbf7d0",
  margin: "24px 0",
  padding: "20px",
  textAlign: "center" as const,
};

const detailsTitle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#16a34a",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: 1,
};

const productNameStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: "#1a1a2e",
  margin: "0 0 8px",
};

const detailsText = {
  color: "#4b5563",
  fontSize: 13,
  lineHeight: "20px",
  margin: 0,
};

const ctaSection = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#25a65b",
  borderRadius: 8,
  color: "#ffffff",
  display: "inline-block",
  fontSize: 14,
  fontWeight: 600,
  padding: "12px 28px",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0 16px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: 11,
  lineHeight: "18px",
  margin: 0,
};
