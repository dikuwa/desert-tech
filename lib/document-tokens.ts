/**
 * Document token store for generating and retrieving public
 * receipt and quotation tokens.
 *
 * Tokens are cryptographically random strings that map to
 * order/quotation data without exposing internal IDs.
 */

import crypto from "node:crypto";

export type DocumentType = "receipt" | "quotation";

interface DocumentEntry {
  token: string;
  type: DocumentType;
  /** Order number for receipts, quotation number for quotations */
  documentNumber: string;
  /** The internal ID used to look up data from the store */
  referenceId: string;
  createdAt: string;
  expiresAt?: string;
}

const tokens = new Map<string, DocumentEntry>();

/**
 * Generate a secure random token for a document.
 * Returns the token string.
 */
export function generateDocumentToken(
  type: DocumentType,
  referenceId: string,
  documentNumber: string,
  ttlDays = 90,
): string {
  const token = crypto.randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

  tokens.set(token, {
    token,
    type,
    documentNumber,
    referenceId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return token;
}

/**
 * Retrieve a document entry by token.
 * Returns undefined if token doesn't exist or is expired.
 */
export function getDocumentByToken(token: string): DocumentEntry | undefined {
  const entry = tokens.get(token);
  if (!entry) return undefined;

  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    tokens.delete(token);
    return undefined;
  }

  return entry;
}

/**
 * Generate a public URL for a document token.
 */
export function getPublicDocumentUrl(token: string, type: DocumentType): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const path = type === "receipt" ? "receipt" : "quote";
  return `${baseUrl}/${path}/${token}`;
}

/**
 * Get all tokens for a given reference ID (for admin management).
 */
export function getTokensForReference(referenceId: string): DocumentEntry[] {
  const all: DocumentEntry[] = [];
  for (const entry of tokens.values()) {
    if (entry.referenceId === referenceId) {
      all.push(entry);
    }
  }
  return all;
}

/**
 * Revoke a token (e.g., when admin regenerates).
 */
export function revokeToken(token: string): boolean {
  return tokens.delete(token);
}
