# Pre-Deploy Code Review Report

**Project:** Desert Technology Consultant  
**Date:** June 4, 2026  
**Review Type:** Pre-deployment audit

---

## Executive Summary

| Severity | Count |
|----------|-------|
| **Critical** | 4 |
| **High** | 5 |
| **Medium** | 4 |
| **Low** | 3 |

The codebase is largely production-ready with good architecture, Zustand state management, and clean component structure. The critical issues are primarily around XSS prevention, hardcoded URLs, and missing loading/suspense boundaries.

---

## Critical Issues (Must Fix Before Production)

### C1. XSS Vulnerability via `dangerouslySetInnerHTML`

**Files:**
- `app/(dashboard)/dashboard/settings/page.tsx` (line 420)
- `components/storefront/hero-section.tsx` (line 54)

**Risk:** Both files use `dangerouslySetInnerHTML` to render the hero heading. While the content comes from the admin dashboard (not directly from user input), an admin account compromise could inject malicious scripts.

**Fix:** Sanitize the HTML before rendering. Use DOMPurify or restrict to known safe HTML entities only.

```typescript
// Option 1: Install DOMPurify
import DOMPurify from "dompurify";
// ...
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(heading) }}

// Option 2: Use a simpler approach — only allow &rsquo; &mdash; etc.
// Replace the dangerouslySetInnerHTML with a text node that handles common entities
```

### C2. Hardcoded `localhost:3000` in Auth Configuration

**File:** `lib/auth.ts`

**Risk:** In production, the `baseURL` set to `http://localhost:3000` will break Better Auth callback URLs, preventing login and redirecting users to a non-existent local server.

**Fix:**
```typescript
const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
```

### C3. Missing Dynamic Imports for Heavy Libraries

**Files:** No `next/dynamic` usage found anywhere in `app/`, `components/`, or `lib/`

**Risk:** Heavy components (charts, PDF rendering, data tables) are loaded synchronously, increasing initial bundle size. 51 client components are loaded eagerly.

**Fix:** Use `next/dynamic` for:
- Any chart/visualization components
- Receipt PDF generation (if used on client)
- Data table components with large datasets

### C4. Pre-existing TypeScript Compilation Error

**File:** `lib/auth-guard.ts` (line 8)

**Error:** `Module '"@/lib/auth"' has no exported member 'isAuthMockMode'`

**Risk:** This will cause the production build to fail (`next build` exits with error on TS errors).

**Fix:** Either:
1. Export `isAuthMockMode` from `lib/auth.ts`
2. Or remove the import from `lib/auth-guard.ts` if unused

### C5. No Suspense Boundaries Around Data-Fetching Components

**Files:** No `Suspense` usage found in `app/` or `components/`

**Risk:** Data-fetching components block the entire page render. Users see blank or loading states instead of progressively rendered content.

**Fix:** Wrap data-fetching sections in `<Suspense>` with meaningful fallbacks.

---

## High Priority Issues

### H1. Granular Error Boundaries Missing

**Current state:** Only root `app/error.tsx` exists. No per-section error boundaries.

**Risk:** A crash in the sidebar, footer, or a single component takes down the entire page.

**Fix:** Add `<ErrorBoundary>` wrappers around major page blocks:
- Dashboard sidebar
- Storefront header
- Product listings
- Order detail sections

### H2. Granular Loading States Missing

**Current state:** Only root `app/loading.tsx` exists. No route-level loading files for `app/(storefront)/shop/`, `app/(dashboard)/dashboard/orders/`, etc.

**Risk:** Users see a full-page loader for every navigation instead of targeted loading skeletons.

**Fix:** Add route-specific `loading.tsx` files with skeleton placeholders.

### H3. Hardcoded `localhost:3000` in Email Templates

**Files:**
- `components/emails/receipt-email.tsx`
- `components/emails/order-confirmation-email.tsx`

**Risk:** Emails sent in production will contain broken links pointing to `http://localhost:3000` instead of the production domain.

**Fix:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://deserttechnology.com.na";
```

### H4. Hardcoded `localhost:3000` in Auth Client

**File:** `lib/auth-client.ts`

**Risk:** Same as C2 — auth client redirects will break in production.

**Fix:**
```typescript
baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://deserttechnology.com.na"
```

### H6. Duplicate BETTER_AUTH_SECRET in .env.local

**File:** `.env.local`

**Risk:** The placeholder value `dev-secret-change-in-production-min-32-chars!!` is set first and will be used instead of the real `tYsaVzSePFC4lGxtiCBp3epdtOPTpMdv`. This means auth uses a weak, well-known secret in production.

**Fix:** Remove the placeholder line:
```
BETTER_AUTH_SECRET=tYsaVzSePFC4lGxtiCBp3epdtOPTpMdv
```

### H7. API Routes Lack Explicit Auth Checks

**Files:**
- `app/api/orders/route.ts`
- `app/api/receipts/send/route.ts`
- `app/api/upload/route.ts`

**Risk:** These routes are not covered by the `/dashboard` middleware protection and may be accessible without authentication unless they implement their own session checks.

**Fix:** Verify each API route has proper session validation or is meant to be public (e.g., the order creation endpoint for guest checkout).

---

## Medium Priority Issues

### M1. Redis Cache TTL May Be Too Short

**File:** `lib/cache.ts` — default TTL is 60 seconds

**Impact:** Frequently accessed data (product listings, categories) is re-fetched every 60 seconds, reducing cache effectiveness.

**Fix:** Use longer TTLs for reference data:
```typescript
// Products: 5 minutes
// Categories: 30 minutes
// Dashboard stats: 2 minutes
```

### M2. Hero Image Missing `priority` Attribute

**File:** `components/storefront/hero-section.tsx`

**Impact:** The hero image is an LCP (Largest Contentful Paint) contributor. Without `priority`, it may load late.

**Fix:** Add `priority` to the hero `<img>` tag, or use `next/image` with `priority`.

### M3. No `will-change` on Animated Elements

**Files where framer-motion is used:**
- `app/(dashboard)/dashboard/page.tsx`
- `components/storefront/product-card.tsx`

**Impact:** Missing `will-change: transform` on animated elements can cause janky animations.

**Fix:** Add `will-change: transform` to animated containers.

### M4. Framer Motion Not Dynamically Imported

**Current state:** Framer Motion is eagerly imported in 2 files.

**Impact:** Increases initial bundle size for pages that may never animate.

**Fix:** Lazy-load animated components or use `next/dynamic` for framer-motion components.

---

## Low Priority Issues

### L1. No Bundle Analyzer Configured

No `@next/bundle-analyzer` or similar tool is configured. Bundle size isn't tracked.

### L2. No Preload for Primary Font

The Space Grotesk font is loaded with `display: "swap"` but no explicit preload link. Font swap may cause a flash of unstyled text.

---

## Recommendations

1. **Fix all Critical issues before deploying** — especially the hardcoded URLs and XSS vectors.
2. **Add Suspense boundaries** around the product grid and dashboard stat cards for progressive rendering.
3. **Set up bundle analysis** (`ANALYZE=true pnpm build`) to identify additional optimization opportunities.
4. **Update NEXT_PUBLIC_APP_URL** to the production domain in Vercel environment variables.

---

## Security Checklist

| Item | Status |
|------|--------|
| No hardcoded secrets in source code | ⚠️ Duplicate BETTER_AUTH_SECRET in .env.local |
| CSRF protection enabled | ✅ Better Auth handles this |
| Input validation on all forms | ✅ Zod schemas on checkout forms |
| XSS prevention | ❌ dangerouslySetInnerHTML unsanitized |
| Auth routes protected | ⚠️ API routes need verification |
| Rate limiting on auth endpoints | ❌ Not configured |
| CORS configured | ✅ Handled by Vercel |
| HTTPS enforced | ✅ Vercel default |
| Security headers set | ⚠️ Verify Vercel configuration |

---

*Generated by automated pre-deploy audit*
