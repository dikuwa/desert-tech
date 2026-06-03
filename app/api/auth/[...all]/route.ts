/**
 * Better Auth API route handler.
 *
 * In real mode (DATABASE_URL set): delegates to Better Auth's next-js handler.
 * In mock mode (no database): handles mock auth endpoints so the app still functions.
 *
 * Note: We use deferred imports here to avoid circular dependency issues
 * with better-auth's bundled kysely adapter during the build.
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

async function handleMockRequest(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth/", "");

  // GET /api/auth/get-session
  if (path === "get-session" && request.method === "GET") {
    const cookie = request.cookies.get(MOCK_SESSION_COOKIE);
    if (cookie?.value?.startsWith("mock-session-")) {
      const userId = cookie.value.split("-")[2];
      const user = MOCK_USERS.find((u) => u.id === userId);
      if (user) {
        return NextResponse.json(createMockSession(user));
      }
    }
    return NextResponse.json(null);
  }

  // POST /api/auth/sign-in/email
  if (path === "sign-in/email" && request.method === "POST") {
    const body = await request.json();
    const { email } = body || {};
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }
    const session = createMockSession(user);
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

// Real auth handler — imported lazily to avoid build-time circular deps
async function getRealHandler() {
  const { auth } = await import("@/lib/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  return toNextJsHandler(auth);
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return handleMockRequest(request);
  }
  const handler = await getRealHandler();
  return handler.GET(request);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return handleMockRequest(request);
  }
  const handler = await getRealHandler();
  return handler.POST(request);
}
