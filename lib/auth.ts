/**
 * Better Auth configuration for Desert Tech.
 * Invite-only authentication with role-based access control.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { twoFactor } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@/lib/enums";
import { sendPasswordResetEmail } from "@/lib/email";
import { ensureSystemUsers, SYSTEM_USERS } from "@/lib/system-users";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://deserttechnology.com.na");
const trustedOrigins = Array.from(new Set([
  baseURL,
  process.env.NEXT_PUBLIC_APP_URL,
  "https://deserttechnology.com.na",
  "http://localhost:3000",
  "http://localhost:3040",
].filter((origin): origin is string => Boolean(origin))));

/**
 * Returns true when no real database is configured (mock/dev mode).
 */
export function isAuthMockMode(): boolean {
  return !process.env.DATABASE_URL;
}

/**
 * Better Auth configuration with Prisma adapter.
 * Features:
 * - Email/password authentication
 * - Password reset
 * - Two-factor authentication (TOTP)
 * - Session management
 * - Disabled public sign-up
 */
export const auth = betterAuth({
  baseURL,
  trustedOrigins,

  // Database adapter
  database: db ? prismaAdapter(db, { provider: "postgresql" }) : undefined,

  // Email and password configuration
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetEmail({ to: user.email, token });
    },
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },

  // Email verification configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Auth] Verification email for ${user.email}: ${url}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24, // 1 day
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    ipAddress: {
      disableIpTracking: false,
    },
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },

  plugins: [
    twoFactor({
      issuer: "Desert Technology Consultant",
      backupCodeOptions: { amount: 10 },
    }),
  ],

  // Custom fields to include in session/user objects
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.STAFF,
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
        input: false,
      },
      permissions: {
        type: "json",
        required: false,
        input: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
      mustChangePassword: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
      invitedById: {
        type: "string",
        required: false,
        input: false,
      },
      profileEmail: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email" || !db || !ctx.body?.email) return;

      const email = String(ctx.body.email).toLowerCase().trim();
      if (SYSTEM_USERS.some((user) => user.email === email)) {
        await ensureSystemUsers(db);
      }

      const user = await db.user.findUnique({
        where: { email },
        select: { status: true, role: true, twoFactorEnabled: true, mustChangePassword: true, permissions: true },
      });

      if (!user) return;

      // Account status check
      if (user.status !== UserStatus.ACTIVE) {
        throw new APIError("FORBIDDEN", {
          message: "This account is not active. Contact an administrator.",
        });
      }

      // Force password change for fresh accounts
      if (user.mustChangePassword) {
        throw new APIError("FORBIDDEN", {
          message: "You must change your password before accessing the dashboard. Please use the forgot password flow or contact your administrator.",
        });
      }

      // 2FA enforcement is handled by the Better Auth twoFactor plugin
      // during sign-in. It is NOT enforced here to avoid locking users out
      // before they have a chance to set it up in Settings > Account.
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email" || !db) return;
      const userId = ctx.context.newSession?.user.id;
      if (userId) {
        await db.user.update({
          where: { id: userId },
          data: { lastActiveAt: new Date() },
        });
      }
    }),
  },
});

// Export types
export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session;
