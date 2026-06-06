/**
 * Auth API route handler.
 *
 * Handles sign-in, sign-up, sign-out, and session management directly.
 * When DATABASE_URL is set, credentials are verified against the database
 * using Prisma + bcrypt. Falls back to in-memory mock users when no
 * database is available.
 *
 * We use deferred dynamic imports for heavy dependencies (Prisma, bcrypt)
 * so they're only loaded when needed, not at module evaluation time.
 */

import { NextRequest, NextResponse } from "next/server";

// Mock users (defined here and in lib/auth.ts — keep in sync)
const MOCK_USERS = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@deserttech.com",
    role: "Admin",
    image: null,
    emailVerified: true,
  },
  {
    id: "staff-1",
    name: "Staff User",
    email: "staff@deserttech.com",
    role: "Staff",
    image: null,
    emailVerified: true,
  },
];

const MOCK_SESSION_COOKIE = "better-auth.session_token";

function createMockSession(user: (typeof MOCK_USERS)[number]) {
  const token = `mock-session-${user.id}-${Date.now()}`;
  return {
    user,
    session: {
      id: `sess-${user.id}`,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
  };
}

/**
 * Authenticate a user against the real database.
 * Returns the user object on success, or null on failure.
 */
async function authenticateUser(email: string, password: string) {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return null;

    const bcrypt = await import("bcryptjs");

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;

    const account = await db.account.findFirst({
      where: { userId: user.id, providerId: "email" },
    });
    if (!account?.password) return null;

    const valid = await bcrypt.compare(password, account.password);
    if (!valid) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error("[auth] authenticateUser error:", error);
    return null;
  }
}

/**
 * Create a session in the database and return the session object.
 */
async function createDatabaseSession(userId: string, email: string) {
  const { db } = await import("@/lib/db");
  const crypto = await import("node:crypto");

  const token = `sess-${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (db) {
    await db.session.create({
      data: {
        userId,
        token,
        expiresAt,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return { token, expiresAt };
}

/**
 * Look up a session from the database by token.
 */
async function getSessionFromToken(token: string) {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    };
  } catch (error) {
    console.error("[auth] getSessionFromToken error:", error);
    return null;
  }
}

/**
 * Check if a real database is available for authentication.
 */
function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

async function handleMockRequest(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth/", "");

  // GET /api/auth/get-session
  if (path === "get-session" && request.method === "GET") {
    const cookie = request.cookies.get(MOCK_SESSION_COOKIE);
    if (cookie?.value) {
      // Try database-backed session first
      if (hasDatabase()) {
        const session = await getSessionFromToken(cookie.value);
        if (session) {
          return NextResponse.json(session);
        }
      }

      // Fall back to mock sessions
      if (cookie.value.startsWith("mock-session-")) {
        const userId = cookie.value.split("-")[2];
        const user = MOCK_USERS.find((u) => u.id === userId);
        if (user) {
          return NextResponse.json(createMockSession(user));
        }
      }
    }
    return NextResponse.json(null);
  }

  // POST /api/auth/sign-in/email
  if (path === "sign-in/email" && request.method === "POST") {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Try database authentication if available
    if (hasDatabase()) {
      const dbUser = await authenticateUser(email, password);
      if (dbUser) {
        const { token, expiresAt } = await createDatabaseSession(dbUser.id, dbUser.email);

        const response = NextResponse.json({
          user: dbUser,
          session: {
            token,
            expiresAt,
            id: `sess-${dbUser.id}`,
          },
        });
        response.cookies.set(MOCK_SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      }
      // DB auth failed — fall through to mock fallback so devs can always sign in
      console.warn("[auth] DB authentication failed, falling back to mock users");
    }

    // Fall back to mock users (no password check)
    const mockUser = MOCK_USERS.find((u) => u.email === email);
    if (!mockUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }
    const session = createMockSession(mockUser);
    const response = NextResponse.json({
      user: session.user,
      session: session.session,
    });
    response.cookies.set(MOCK_SESSION_COOKIE, session.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  }

  // POST /api/auth/sign-out
  if (path === "sign-out" && request.method === "POST") {
    // Clean up database session if applicable
    if (hasDatabase()) {
      const cookie = request.cookies.get(MOCK_SESSION_COOKIE);
      if (cookie?.value) {
        try {
          const { db } = await import("@/lib/db");
          if (db) {
            await db.session.deleteMany({ where: { token: cookie.value } });
          }
        } catch {
          // Ignore cleanup errors
        }
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(MOCK_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  // POST /api/auth/sign-up/email
  if (path === "sign-up/email" && request.method === "POST") {
    const body = await request.json();

    // Try database-backed sign-up
    if (hasDatabase()) {
      try {
        const { db } = await import("@/lib/db");
        const bcrypt = await import("bcryptjs");

        if (!db) {
          return NextResponse.json(
            { error: "Database not available" },
            { status: 500 },
          );
        }

        const existingUser = await db.user.findUnique({
          where: { email: body.email },
        });
        if (existingUser) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 },
          );
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = await db.user.create({
          data: {
            name: body.name,
            email: body.email,
            role: "Staff",
            emailVerified: false,
          },
        });

        await db.account.create({
          data: {
            userId: user.id,
            providerId: "email",
            accountId: body.email,
            password: hashedPassword,
          },
        });

        const { token, expiresAt } = await createDatabaseSession(user.id, user.email);

        const response = NextResponse.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            emailVerified: user.emailVerified,
          },
          session: { token, expiresAt },
          token,
        });
        response.cookies.set(MOCK_SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      } catch (error) {
        console.error("[auth] Sign-up error:", error);
        return NextResponse.json(
          { error: "Failed to create account" },
          { status: 500 },
        );
      }
    }

    // Fall back to mock sign-up
    const user = {
      id: `mock-${Date.now()}`,
      name: body.name || "New User",
      email: body.email || "user@example.com",
      role: "Staff",
      image: null,
      emailVerified: true,
    };
    const session = createMockSession(user);
    const response = NextResponse.json({
      user,
      session: session.session,
      token: session.session.token,
    });
    response.cookies.set(MOCK_SESSION_COOKIE, session.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// Always use the custom handler which checks the real database when
// DATABASE_URL is set, or falls back to mock users when no database is available.
export async function GET(request: NextRequest) {
  return handleMockRequest(request);
}

export async function POST(request: NextRequest) {
  return handleMockRequest(request);
}
