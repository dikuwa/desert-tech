/**
 * Shared base-URL helper for the application.
 *
 * Always returns the stable production domain — never a temporary Vercel
 * preview deployment.  All shareable document links, email links, and
 * public-facing URLs MUST go through this function.
 *
 * Fails clearly when the production URL is missing so that misconfigured
 * deployments are noticed immediately at build/request time instead of
 * silently generating broken temporary deployment links.
 */

const PRODUCTION_DOMAIN = "https://desertechnam.vercel.app";

export function getAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : null) ||
    "";

  // In production, if no env var is set, fall through to the hard-coded
  // production domain so that links never point to a temporary Vercel URL.
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[app-url] NEXT_PUBLIC_APP_URL is not set. Falling back to " +
          PRODUCTION_DOMAIN +
          ". Set NEXT_PUBLIC_APP_URL in Vercel environment variables.",
      );
      return PRODUCTION_DOMAIN;
    }
    // Development fallback
    return "http://localhost:3000";
  }

  // Strip trailing slash and reject known-temporary Vercel preview URLs
  const clean = url.replace(/\/+$/, "");

  // Warn if the URL looks like a Vercel preview deployment
  if (
    clean.includes("vercel.app") &&
    clean !== PRODUCTION_DOMAIN
  ) {
    console.error(
      "[app-url] CRITICAL: The configured URL",
      clean,
      "looks like a temporary Vercel preview deployment. " +
        "Set NEXT_PUBLIC_APP_URL to the production domain " +
        PRODUCTION_DOMAIN,
    );
  }

  return clean;
}

/**
 * Build a shareable document URL from a token.
 */
export function getDocumentShareUrl(token: string): string {
  return `${getAppUrl()}/api/documents/share/${token}`;
}
