/**
 * Document token store for generating and retrieving public
 * receipt, quotation, and invoice share links.
 *
 * **Signed token approach** — each token is a self-contained payload
 * (type, referenceId, documentNumber, plus an optional data snapshot)
 * signed with HMAC-SHA256 using DOCUMENT_SHARE_SECRET.  No server-side
 * storage is needed, so tokens survive redeploys and server restarts.
 *
 * The data snapshot allows the public PDF share route to work even
 * when the in-memory dashboard store has been reset (e.g. after a
 * server restart or a new Vercel deployment).
 *
 * **Token format:**
 *   base64(compressedPayload) . "." . base64(signature)
 *
 * The payload is gzip-compressed before base64-encoding to keep
 * share URLs short (especially when large data snapshots are included).
 *
 * Backwards compatibility: tokens starting with "A" (uncompressed)
 * or "B" (gzip compressed) are both supported on decode.
 *
 * Payload structure (same property names as always — gzip handles
 * the repetition):
 *   {
 *     type: "receipt" | "quotation" | "invoice",
 *     referenceId: string,
 *     documentNumber: string,
 *     data?: DocumentDataSnapshot,
 *     iat: number,
 *     exp?: number
 *   }
 */

import crypto from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

export type DocumentType = "receipt" | "quotation" | "invoice";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Data snapshot that the PDF generator needs.  We store this inside the
 * signed token so the /api/documents/share/[token] route can render the
 * PDF without reaching into the (possibly-reset) in-memory store.
 */
export interface DocumentDataSnapshot {
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    sku?: string;
  }>;
  subtotalCents?: number;
  paymentStatus?: string;
  totalPaidCents?: number;
  balanceDueCents?: number;
  createdAt?: string;
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
  status?: string;
  notes?: string;
  quotationNumber?: string;
}

/**
 * Token payload stored inside the signed token.
 * Uses descriptive property names — gzip compression handles the
 * repetition efficiently, so there is no need for single-letter keys.
 */
interface TokenPayload {
  type: DocumentType;
  referenceId: string;
  documentNumber: string;
  data?: DocumentDataSnapshot;
  iat: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// Signing / verification
// ---------------------------------------------------------------------------

function getSigningSecret(): string {
  return (
    process.env.DOCUMENT_SHARE_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    "dev-document-share-secret"
  );
}

/** URL-safe base64 encode (no padding, no +/= chars). */
function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode URL-safe base64 back to Buffer. */
function base64urlDecode(str: string): Buffer {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

/**
 * Sign with HMAC-SHA256 and truncate to 16 bytes (128 bits).
 * 128-bit security is more than sufficient for document tokens.
 */
function signPayload(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSigningSecret());
  hmac.update(payload);
  // Truncate to 16 bytes to save ~22 chars after base64 encoding
  return base64url(hmac.digest().subarray(0, 16));
}

// ---------------------------------------------------------------------------
// Encode / decode helpers
// ---------------------------------------------------------------------------

/** Encode payload bytes — always gzip-compress. */
function encodeBytes(buf: Buffer): Buffer {
  return gzipSync(buf, { level: 6 });
}

/** Decode payload bytes — try gzip first, fall back to raw. */
function decodeBytes(buf: Buffer): Buffer {
  // Gunzip may throw if data is not gzip-compressed
  try {
    return gunzipSync(buf);
  } catch {
    // Fall through for legacy uncompressed tokens
  }
  return buf;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a signed document token with gzip-compressed payload.
 *
 * @param type        Document type
 * @param referenceId Internal order ID, order number, quotation ID, etc.
 * @param documentNumber  Human-readable document number (e.g. RCP-xxx)
 * @param data        Optional data snapshot so PDF generation works
 *                    independently of the in-memory store
 * @param ttlDays     Token time-to-live in days (default 365)
 */
export function generateDocumentToken(
  type: DocumentType,
  referenceId: string,
  documentNumber: string,
  data?: DocumentDataSnapshot,
  ttlDays = 365,
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    type,
    referenceId,
    documentNumber,
    iat: now,
    exp: now + ttlDays * 24 * 60 * 60,
  };
  if (data) {
    payload.data = data;
  }

  // Compress and base64-encode
  const json = JSON.stringify(payload);
  const compressed = encodeBytes(Buffer.from(json, "utf8"));
  const encoded = base64url(compressed);
  const sig = signPayload(encoded);
  return `${encoded}.${sig}`;
}

/**
 * Verify and decode a signed document token.
 * Returns null if the token is invalid, tampered, or expired.
 *
 * Supports both gzip-compressed (new) and uncompressed (legacy) payloads.
 */
export function verifyDocumentToken(
  token: string,
): TokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Verify signature
  const expectedSig = signPayload(encoded);
  if (
    sig.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  ) {
    return null;
  }

  // Decode payload — try gzip decompression first, fall back to raw (legacy)
  try {
    const raw = decodeBytes(base64urlDecode(encoded));
    const payload: TokenPayload = JSON.parse(raw.toString("utf8"));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieve a document entry by token (legacy alias).
 * Returns the decoded token payload or undefined if invalid.
 */
export function getDocumentByToken(
  token: string,
): {
  token: string;
  type: DocumentType;
  documentNumber: string;
  referenceId: string;
  createdAt: string;
  expiresAt?: string;
} | undefined {
  const payload = verifyDocumentToken(token);
  if (!payload) return undefined;

  return {
    token,
    type: payload.type,
    documentNumber: payload.documentNumber,
    referenceId: payload.referenceId,
    createdAt: new Date(payload.iat * 1000).toISOString(),
    expiresAt: payload.exp
      ? new Date(payload.exp * 1000).toISOString()
      : undefined,
  };
}

import { getDocumentShareUrl } from "./app-url";

/**
 * Generate a public URL for a document token.
 *
 * Uses the stable production domain via getAppUrl() — never a temporary
 * Vercel preview deployment.
 */
export function getPublicDocumentUrl(token: string, _type: DocumentType): string {
  return getDocumentShareUrl(token);
}

/**
 * Get all tokens for a given reference ID.
 *
 * NOTE: Since signed tokens are self-contained and not stored on the
 * server, this returns an empty array.  Token re-generation is idempotent
 * and will produce a new valid token each time.
 */
export function getTokensForReference(_referenceId: string): Array<{
  token: string;
  type: DocumentType;
  documentNumber: string;
  referenceId: string;
  createdAt: string;
  expiresAt?: string;
}> {
  return [];
}

/**
 * Revoke a token.
 *
 * With signed tokens, revocation isn't possible without a blocklist.
 * Returns false to indicate the token is still technically valid.
 * If revocation is needed, change the DOCUMENT_SHARE_SECRET env var,
 * which invalidates all existing tokens.
 */
export function revokeToken(_token: string): boolean {
  return false;
}
