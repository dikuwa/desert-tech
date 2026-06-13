"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Users, Bell, CalendarClock, AlertTriangle, ArrowRight, TrendingUp, Package, Inbox } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents } from "@/lib/dashboard-data";
import { Permissions } from "@/lib/permissions";
import { cn } from "@/lib/utils";

// Stable selector to avoid infinite re-render loop in Zustand.
// Returning a new array literal `[]` on every render causes React's
// useSyncExternalStore to detect a changed snapshot and re-render forever.
const EMPTY_PERMISSIONS: string[] = [];
const selectStaffPermissions = (s: {
  currentUser: string;
  staff: { name: string; permissions?: string[] }[];
}) => {
  const member = s.staff.find((m) => m.name === s.currentUser);
  return member?.permissions ?? EMPTY_PERMISSIONS;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<{
    name: string; email: string; role: string; status: string; image?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) {
          setProfile({
            name: data.user.name || "User",
            email: data.user.email || "",
            role: data.user.role || "—",
            status: data.user.status || "—",
            image: data.user.image || undefined,
          });
        }
      })
      .catch(() => {});
  }, []);

  const orders = useDashboardStore((s) => s.orders);
  const products = useDashboardStore((s) => s.products);
  const customers = useDashboardStore((s) => s.customers);
  const notifications = useDashboardStore((s) => s.notifications);
  const followUps = useDashboardStore((s) => s.followUps);
  const staffPermissions = useDashboardStore(selectStaffPermissions);

  const payments = useDashboardStore((s) => s.payments);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const totalRevenue = payments
    .filter((p) => p.status === "Confirmed")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const pendingOrders = orders.filter((o) => o.contactStatus === "NotContacted");
  const lowStockProducts = products.filter((p) => p.availability === "LowStock" || p.stockQuantity <= p.lowStockThreshold);
  const pendingFollowUps = followUps.filter((f) => f.status === "Pending");
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Financial permission check — uses session role for accurate gating
  const userSessionRole = profile?.role;
  const hasFinancialAccess =
    userSessionRole === "OWNER" ||
    (userSessionRole !== "STAFF" && userSessionRole !== "" && (
      staffPermissions.includes(Permissions.PAYMENTS_VIEW) ||
      staffPermissions.includes(Permissions.DASHBOARD_VIEW_FINANCIAL_SUMMARY)
    ));

  const stats = [
    { label: "New Orders", value: pendingOrders.length, icon: ShoppingBag, color: "text-primary", bg: "bg-accent", href: "/dashboard/orders" },
    { label: "Low Stock Items", value: lowStockProducts.length, icon: AlertTriangle, color: "text-warning", bg: "bg-warning-soft", href: "/dashboard/products" },
    { label: "Pending Follow-ups", value: pendingFollowUps.length, icon: CalendarClock, color: "text-info", bg: "bg-info-soft", href: "/dashboard/follow-ups" },
    { label: "Unread Notifications", value: unreadNotifications.length, icon: Bell, color: "text-destructive", bg: "bg-destructive/10", href: "/dashboard/notifications" },
    { label: "Total Customers", value: customers.length, icon: Users, color: "text-success", bg: "bg-success-soft", href: "/dashboard/customers" },
    ...(hasFinancialAccess
      ? [{ label: "Revenue Collected", value: formatCents(totalRevenue), icon: TrendingUp as typeof TrendingUp, color: "text-success" as const, bg: "bg-success-soft" as const, href: "/dashboard/payments" as const }]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header + Profile card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your store operations.</p>
        </div>

        {profile && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition-all hover:shadow-sm hover:border-primary/20 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold overflow-hidden">
              {profile.image ? (
                <img src={profile.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <span>
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {profile.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {profile.role} · {profile.status}
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Stats Grid - compact, equal height cards */}
      <div className={cn(
        "grid gap-3",
        stats.length === 5 
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" 
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      )}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <FadeIn key={stat.label} delay={i * 0.04}>
              <Link
                href={stat.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20 group h-full"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold text-foreground tabular-nums truncate leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">{stat.label}</p>
                </div>
              </Link>
            </FadeIn>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <FadeIn delay={0.2}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="rounded-xl border border-border bg-card flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border flex-1">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <Link 
                    key={order.id} 
                    href={`/dashboard/orders/${order.id}`} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCents(order.subtotalCents)}</p>
                      <span className={cn(
                        "inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                        order.paymentStatus === "PaidInFull" 
                          ? "bg-success-soft text-success border-success/20" 
                          : "bg-warning-soft text-warning border-warning/20"
                      )}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">New orders will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-card flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              <Link href="/dashboard/notifications" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border flex-1">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((note) => (
                  <div 
                    key={note.id} 
                    className={cn(
                      "flex items-start gap-3 p-4",
                      !note.isRead ? "bg-accent/30" : ""
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      note.type === "order" ? "bg-primary/10 text-primary" :
                      note.type === "payment" ? "bg-success-soft text-success" :
                      note.type === "stock" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"
                    )}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{note.message}</p>
                    </div>
                    {!note.isRead && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">You&apos;re all caught up</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
