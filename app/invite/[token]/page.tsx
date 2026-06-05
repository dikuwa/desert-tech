"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, X, Eye, EyeOff, UserCog } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/utils";

export default function AcceptInvitePage() {
  const params = useParams();
  const token = params.token as string;
  const invites = useDashboardStore((s) => s.invites);
  const markInviteUsed = useDashboardStore((s) => s.markInviteUsed);
  const addStaff = useDashboardStore((s) => s.addStaff);
  const staff = useDashboardStore((s) => s.staff);

  const [invite, setInvite] = useState<{ name: string; email: string; role: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid" | "success">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const found = invites.find((i) => i.token === token);
    if (!found) {
      setStatus("invalid");
      return;
    }
    if (found.usedAt) {
      setStatus("used");
      return;
    }
    setInvite({ name: found.name, email: found.email, role: found.role });
    setStatus("valid");
  }, [token, invites]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!invite) return;

    // Check if email already exists as staff
    if (staff.some((s) => s.email === invite.email)) {
      setError("This email already has an account");
      return;
    }

    // Create the staff member with the user's self-generated password
    addStaff({
      name: invite.name,
      email: invite.email,
      role: invite.role,
      permissions: invite.role === "Admin" ? ["all"] : ["orders:view", "orders:update", "products:view", "customers:view", "followups:manage"],
      isActive: true,
      lastActive: undefined,
      password,
    });

    markInviteUsed(token);
    setStatus("success");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invalid Invitation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invitation link is invalid or has expired. Please ask your admin to send a new invite.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (status === "used") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-info-soft mb-6">
            <Check className="h-8 w-8 text-info" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Already Accepted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invitation has already been used. Please sign in with your account.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft mb-6">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Created!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been set up successfully.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent mb-4">
            <UserCog className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're Invited!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {invite?.name}, welcome to Desert Technology Consultant. Set up your password to get started.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {invite?.email} &middot; {invite?.role}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Create Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "mt-1.5 h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1",
                confirmPassword && password !== confirmPassword
                  ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                  : "border-border focus:border-primary focus:ring-primary/30",
              )}
              placeholder="Repeat password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <Check className="h-4 w-4" />
            Set Password & Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
