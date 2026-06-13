"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the full error for debugging
  console.error("[ErrorBoundary] Uncaught error:", {
    message: error?.message,
    name: error?.name,
    digest: error?.digest,
    stack: error?.stack,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-destructive">Error</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-4 text-xs text-muted-foreground/50 max-w-md font-mono">
          {error?.message || error?.name || "Unknown error"}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
