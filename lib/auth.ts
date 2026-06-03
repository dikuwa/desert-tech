/**
 * Better Auth configuration.
 *
 * When DATABASE_URL is set and the database is available,
 * Better Auth handles real authentication with Prisma.
 *
 * When the database is not available, we fall back to a mock
 * so the app continues to work during development.
 */

import { betterAuth } from "better-auth";

// Determine whether we have a real database
const hasDatabase = !!process.env.DATABASE_URL;

let authInstance: any;

if (hasDatabase) {
  try {
    const { prismaAdapter } = require("better-auth/adapters/prisma");
    const { db } = require("@/lib/db");
    if (!db) throw new Error("Database not available");

    authInstance = betterAuth({
      database: prismaAdapter(db, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    });
  } catch (err) {
    console.warn(
      "[auth] Failed to initialize with Prisma adapter, falling back to mock mode:",
      err,
    );
    authInstance = createMockAuth();
  }
} else {
  authInstance = createMockAuth();
}

export const auth = authInstance as ReturnType<typeof betterAuth>;

/** Helper to check if the app is running in mock auth mode */
export const isAuthMockMode = !hasDatabase;

// --- Mock auth factory ---

const MOCK_USERS = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@deserttech.com",
    role: "Admin" as const,
    image: null,
  },
  {
    id: "staff-1",
    name: "Staff User",
    email: "staff@deserttech.com",
    role: "Staff" as const,
    image: null,
  },
];

function createMockAuth() {
  let currentMockSession: {
    user: (typeof MOCK_USERS)[number];
    session: {
      id: string;
      token: string;
      expiresAt: Date;
      createdAt: Date;
      updatedAt: Date;
      ipAddress: string | null;
      userAgent: string | null;
    };
  } | undefined;

  const instance = betterAuth({
    emailAndPassword: { enabled: true },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: undefined,
  });

  (instance as any).__mockMode = true;
  (instance as any).__mockUsers = MOCK_USERS;
  (instance as any).__setSession = (session: typeof currentMockSession) => {
    currentMockSession = session;
  };
  (instance as any).__getSession = () => currentMockSession;

  return instance;
}
