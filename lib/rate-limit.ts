/**
 * Rate limiting utilities for auth and sensitive operations.
 * Uses database-backed rate limiting with sliding window.
 */

import { db } from "@/lib/db";

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMinutes: 15,
};

// Rate limit configurations by action
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMinutes: 15 },
  "forgot-password": { maxRequests: 3, windowMinutes: 60 },
  "reset-password": { maxRequests: 3, windowMinutes: 60 },
  "invitation-accept": { maxRequests: 5, windowMinutes: 15 },
  "invitation-resend": { maxRequests: 3, windowMinutes: 60 },
  "2fa-verify": { maxRequests: 5, windowMinutes: 15 },
  "backinstock-request": { maxRequests: 5, windowMinutes: 15 },
};

/**
 * Check if a request should be rate limited.
 * Returns { allowed, remaining, resetAt }
 */
export async function checkRateLimit(
  action: string,
  identifier: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}> {
  if (!db) {
    // In mock mode, allow all requests
    return { allowed: true, remaining: 100, resetAt: new Date(Date.now() + 60000) };
  }

  const config = RATE_LIMITS[action] || DEFAULT_CONFIG;
  const key = `${action}:${identifier}`;

  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);

  // Get or create rate limit record
  let rateLimit = await db.rateLimit.findUnique({
    where: { key },
  });

  if (!rateLimit || rateLimit.windowStart < windowStart) {
    // Reset window
    if (rateLimit) {
      await db.rateLimit.delete({ where: { key } });
    }
    rateLimit = await db.rateLimit.create({
      data: {
        key,
        count: 0,
        windowStart: now,
      },
    });
  }

  // Check if limit exceeded
  if (rateLimit.count >= config.maxRequests) {
    const resetAt = new Date(rateLimit.windowStart.getTime() + config.windowMinutes * 60 * 1000);
    const retryAfter = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  // Increment counter
  await db.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  const resetAt = new Date(rateLimit.windowStart.getTime() + config.windowMinutes * 60 * 1000);

  return {
    allowed: true,
    remaining: config.maxRequests - rateLimit.count - 1,
    resetAt,
  };
}

/**
 * Reset rate limit for an action/identifier.
 */
export async function resetRateLimit(action: string, identifier: string) {
  if (!db) return;

  const key = `${action}:${identifier}`;
  await db.rateLimit.deleteMany({
    where: { key },
  });
}

/**
 * Get client IP from request headers.
 */
export function getClientIP(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}
