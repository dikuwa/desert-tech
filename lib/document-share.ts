/**
 * Document short-link service using Redis (Upstash).
 *
 * Maps short random codes to signed document tokens so that customers
 * receive compact branded URLs like https://deserttechnam.com/d/r8K4pQ
 * instead of long token URLs.
 *
 * The underlying signed token (from document-tokens.ts) remains the
 * authoritative payload — the short code is just a cache-key lookup.
 * This means:
 *   - Links survive redeploys (the token is still valid)
 *   - Expiration is checked both at the short-link level and the token level
 *   - Revocation is handled at the short-link level
 */

import { cache } from "./cache";
import { generateDocumentToken, verifyDocumentToken, type DocumentType } from "./document-tokens";
import { getAppUrl } from "./app-url";
import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShortLinkRecord {
  /** Random short code (7 chars, base64url) */
  shortCode: string;
  /** The underlying signed document token */
  token: string;
  /** Document type */
  type: DocumentType;
  /** Internal reference ID (order number, quotation ID, etc.) */
  referenceId: string;
  /** Human-readable document number (e.g. RCP-xxx, QT-xxx) */
  documentNumber: string;
  /** When the short link was created (ISO string) */
  createdAt: string;
  /** When the short link expires (ISO string) — null means never */
  expiresAt: string | null;
  /** If non-null, the link was revoked at this time (ISO string) */
  revokedAt: string | null;
  /** Last access timestamp (ISO string) — updated on each resolve */
  lastAccessedAt: string | null;
  /** Number of times this link has been accessed */
  accessCount: number;
}

export interface ShortLinkError {
  code: "NOT_FOUND" | "EXPIRED" | "REVOKED" | "TOKEN_INVALID";
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default TTL: 90 days (in seconds) */
const DEFAULT_TTL_SECONDS = 90 * 24 * 60 * 60;

/** Redis key prefix for short links */
const KEY_PREFIX = "shortlink:";

/** Length of the random short code in characters */
const SHORT_CODE_LENGTH = 7;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a cryptographically random short code (URL-safe, no ambiguous chars). */
function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // No 0/O/1/l/I
  const bytes = crypto.randomBytes(SHORT_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/** Build the Redis key for a short code. */
function redisKey(code: string): string {
  return `${KEY_PREFIX}${code}`;
}

/** Build the public URL for a short code. */
export function getShortLinkUrl(code: string): string {
  return `${getAppUrl()}/d/${code}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a short link for a document token.
 *
 * If a valid non-revoked short link already exists for this reference,
 * it is reused (deduplication).
 *
 * @param type        Document type
 * @param referenceId Internal reference ID
 * @param documentNumber  Human-readable document number
 * @param data        Optional data snapshot (same as generateDocumentToken)
 * @param ttlDays     Short-link TTL in days (default 90)
 * @returns The short link record and public URL
 */
export async function createShortLink(
  type: DocumentType,
  referenceId: string,
  documentNumber?: string,
  data?: Record<string, unknown>,
  ttlDays = 90,
): Promise<{ record: ShortLinkRecord; url: string }> {
  // Check for existing valid short link for this reference
  const existing = await findValidShortLink(referenceId, type);
  if (existing) {
    return { record: existing, url: getShortLinkUrl(existing.shortCode) };
  }

  // Generate the signed token (which encodes all document data)
  const token = generateDocumentToken(type, referenceId, documentNumber || referenceId, data as any, ttlDays);
  const shortCode = generateShortCode();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

  const record: ShortLinkRecord = {
    shortCode,
    token,
    type,
    referenceId,
    documentNumber: documentNumber || referenceId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    lastAccessedAt: null,
    accessCount: 0,
  };

  // Store in Redis with TTL matching the link expiration
  await cache.set(redisKey(shortCode), JSON.stringify(record), {
    ex: ttlDays * 24 * 60 * 60,
  });

  return { record, url: getShortLinkUrl(shortCode) };
}

/**
 * Resolve a short code to a document token.
 *
 * Returns the short link record with updated access stats,
 * or a ShortLinkError if the link is invalid/expired/revoked.
 *
 * The caller should then verify the underlying token with
 * verifyDocumentToken() before using the document data.
 */
export async function resolveShortLink(
  code: string,
): Promise<{ record: ShortLinkRecord; token: string } | ShortLinkError> {
  const raw = await cache.get<string>(redisKey(code));
  if (!raw) {
    return { code: "NOT_FOUND", message: "This document link is invalid or has expired." };
  }

  let record: ShortLinkRecord;
  try {
    record = JSON.parse(raw);
  } catch {
    return { code: "NOT_FOUND", message: "This document link is invalid." };
  }

  // Check expiration
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return { code: "EXPIRED", message: "This document link has expired. Please contact Desert Technology for a new copy." };
  }

  // Check revocation
  if (record.revokedAt) {
    return { code: "REVOKED", message: "This document link is no longer available." };
  }

  // Verify the underlying signed token
  const payload = verifyDocumentToken(record.token);
  if (!payload) {
    return { code: "TOKEN_INVALID", message: "This document link is invalid or has expired." };
  }

  // Update access stats (fire-and-forget — don't block the response)
  record.lastAccessedAt = new Date().toISOString();
  record.accessCount += 1;
  cache.set(redisKey(code), JSON.stringify(record), {
    ex: DEFAULT_TTL_SECONDS,
  }).catch(() => {
    // Non-critical — don't fail the request
  });

  return { record, token: record.token };
}

/**
 * Revoke a short link so it can no longer be used.
 */
export async function revokeShortLink(code: string): Promise<boolean> {
  const raw = await cache.get<string>(redisKey(code));
  if (!raw) return false;

  try {
    const record: ShortLinkRecord = JSON.parse(raw);
    record.revokedAt = new Date().toISOString();
    await cache.set(redisKey(code), JSON.stringify(record), {
      ex: DEFAULT_TTL_SECONDS,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Find an existing valid (non-revoked, non-expired) short link for a
 * given reference ID and document type.
 */
export async function findValidShortLink(
  referenceId: string,
  type: DocumentType,
): Promise<ShortLinkRecord | null> {
  // Redis doesn't support secondary indexes, so we scan for matching records.
  // In practice, the number of short links per document is very small.
  let cursor = 0;
  const now = new Date();

  do {
    const [nextCursor, keys] = await cache.scan(cursor, {
      match: `${KEY_PREFIX}*`,
      count: 100,
    });
    cursor = Number(nextCursor);

    if (keys.length > 0) {
      const values = await cache.mget<string[]>(...keys);
      for (const raw of values) {
        if (!raw) continue;
        try {
          const record: ShortLinkRecord = JSON.parse(raw);
          if (
            record.referenceId === referenceId &&
            record.type === type &&
            !record.revokedAt &&
            (!record.expiresAt || new Date(record.expiresAt) > now)
          ) {
            return record;
          }
        } catch {
          // Skip corrupted records
        }
      }
    }
  } while (cursor !== 0);

  return null;
}
