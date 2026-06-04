import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { db } from "@/lib/db";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Returns true when no real database is configured (mock/dev mode).
 */
export function isAuthMockMode(): boolean {
  return !process.env.DATABASE_URL;
}

export const auth = betterAuth({
  baseURL,
  database: db ? prismaAdapter(db, { provider: "postgresql" }) : undefined,
  emailAndPassword: { enabled: true },
});
