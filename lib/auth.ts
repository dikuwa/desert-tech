import { betterAuth } from "better-auth";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Returns true when no real database is configured (mock/dev mode).
 */
export function isAuthMockMode(): boolean {
  return !process.env.DATABASE_URL;
}

// Note: Better Auth is configured without a database adapter here.
// Authentication is handled by the custom handler in app/api/auth/[...all]/route.ts,
// which uses Prisma directly to verify credentials against the database.
export const auth = betterAuth({
  baseURL,
  emailAndPassword: { enabled: true },
});
