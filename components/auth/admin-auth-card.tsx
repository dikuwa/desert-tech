"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboard";

type AuthMode = "signin" | "signup";

interface AdminAuthCardProps {
  initialMode?: AuthMode;
  redirectTo?: string;
}

const staffPasswordHint = "Staff@2025";

export function AdminAuthCard({ initialMode = "signin", redirectTo = "/dashboard" }: AdminAuthCardProps) {
  const router = useRouter();
  const settings = useDashboardStore((s) => s.settings);
  const storeName = settings?.storeName || "Desert Technology Consultant";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@deserttech.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignIn = mode === "signin";

  const selectAccount = (account: "admin" | "staff") => {
    setMode("signin");
    setEmail(account === "admin" ? "admin@deserttech.com" : "staff@deserttech.com");
    setPassword(account === "staff" ? staffPasswordHint : "");
    setError(null);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    const nextUrl = new URL("/admin", window.location.origin);
    if (nextMode === "signup") nextUrl.searchParams.set("mode", "signup");
    if (redirectTo !== "/dashboard") nextUrl.searchParams.set("redirect", redirectTo);
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(isSignIn ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignIn ? { email, password } : { name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isSignIn ? "Invalid credentials" : "Failed to create account"));
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : isSignIn ? "Failed to sign in" : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {!process.env.NEXT_PUBLIC_APP_URL && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/20 bg-warning-soft p-4 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning mt-0.5" />
            <div>
              <p className="font-semibold text-warning">Development Mode</p>
              <p className="text-warning/80 mt-1">
                No database connected. Admin and staff can sign in with any password.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <Image
                src="/images/desertech-auth-logo.svg"
                alt={storeName}
                width={92}
                height={80}
                priority
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignIn ? "Admin access" : "Create staff account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignIn ? `Sign in to manage ${storeName}` : `Create a ${storeName} dashboard account`}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`rounded-lg px-3 py-2 transition-colors ${
                isSignIn ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-lg px-3 py-2 transition-colors ${
                !isSignIn ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          {isSignIn && (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectAccount("admin")}
                className="h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => selectAccount("staff")}
                className="h-10 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Staff
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isSignIn && (
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder={isSignIn ? "Enter password" : "At least 8 characters"}
                  required
                  minLength={isSignIn ? undefined : 8}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isSignIn ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isSignIn ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isSignIn ? "Sign in" : "Create account"}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="font-semibold text-primary hover:text-primary/80">
              Return to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
