import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware — dashboard routes are currently unprotected during development
// Will be upgraded to use Better Auth once installed for production
const publicPaths = [
  "/",
  "/shop",
  "/cart",
  "/checkout",
  "/order-success",
  "/services",
  "/promotions",
  "/contact",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];
const apiAuthPrefix = "/api/auth";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth API routes
  if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();
  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) return NextResponse.next();
  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/illustrations")
  )
    return NextResponse.next();

  // During development, allow dashboard access without auth
  // This will be replaced with proper Better Auth session check
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
