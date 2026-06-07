/**
 * Middleware for Desert Tech authentication and authorization.
 * Protects dashboard routes and handles redirects.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/shop",
  "/cart",
  "/checkout",
  "/order-success",
  "/services",
  "/promotions",
  "/contact",
  "/search",
  "/admin",
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/invite/accept",
  "/auth/sign-in",
  "/auth/sign-up",
];

const apiAuthPrefix = "/api/auth";
const apiPublicPrefix = "/api/public";
const publicApiMethods: Record<string, string[]> = {
  "/api/orders": ["POST"],
  "/api/back-in-stock-requests": ["POST"],
  "/api/documents/token": ["GET"],
  "/api/products": ["GET"],
  "/api/catalog": ["GET"],
};

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth API routes
  if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();

  // Allow public API routes
  if (pathname.startsWith(apiPublicPrefix)) return NextResponse.next();
  if (publicApiMethods[pathname]?.includes(req.method)) return NextResponse.next();

  // Allow invitation API routes (needed for acceptance)
  if (pathname.startsWith("/api/invitations/validate")) return NextResponse.next();
  if (pathname.startsWith("/api/invitations/accept")) return NextResponse.next();

  // Allow password reset API routes
  if (pathname.startsWith("/api/password-reset")) return NextResponse.next();

  // Redirect old auth paths to new login
  if (pathname === "/auth/sign-in" || pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname === "/auth/sign-up" || pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Allow public paths
  if (isPublicPath(pathname)) return NextResponse.next();

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/illustrations") ||
    pathname.startsWith("/fonts")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie =
    req.cookies.get("__Secure-better-auth.session_token") ??
    req.cookies.get("better-auth.session_token");

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    if (!sessionCookie?.value) {
      // Redirect to login for dashboard routes
      if (pathname.startsWith("/dashboard")) {
        const signInUrl = new URL("/admin/login", req.url);
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Return 401 for API routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
