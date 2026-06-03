import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // Protect dashboard routes — redirect to sign-in if no session cookie
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = req.cookies.get("better-auth.session_token");
    if (!sessionCookie?.value) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
