"use client";

import Link from "next/link";
import { ShoppingBag, Users, Bell, CalendarClock, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { formatCents } from "@/lib/dashboard-data";
import { Permissions } from "@/lib/permissions";

export default function DashboardPage() {
  const orders = useDashboardStore((s) => s.orders);
  const products = useDashboardStore((s) => s.products);
  const customers = useDashboardStore((s) => s.customers);
  const notifications = useDashboardStore((s) => s.notifications);
  const followUps = useDashboardStore((s) => s.followUps);
  const userRole = useDashboardStore((s) => s.userRole);
  const staffPermissions = useDashboardStore((s) => {
    const currentUser = s.currentUser;
    const member = s.staff.find((m) => m.name === currentUser);
    return member?.permissions ?? [];
  });

  const payments = useDashboardStore((s) => s.payments);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const totalRevenue = payments
    .filter((p) => p.status === "Confirmed")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const pendingOrders = orders.filter((o) => o.contactStatus === "NotContacted");
  const lowStockProducts = products.filter((p) => p.availability === "LowStock" || p.stockQuantity <= p.lowStockThreshold);
  const pendingFollowUps = followUps.filter((f) => f.status === "Pending");
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Financial permission check
  // Real permission system: check for PAYMENTS_VIEW or DASHBOARD_VIEW_FINANCIAL_SUMMARY
  // Fallback for mock/legacy data: Admin with "all" permissions
  const hasFinancialAccess =
    staffPermissions.includes(Permissions.PAYMENTS_VIEW) ||
    staffPermissions.includes(Permissions.DASHBOARD_VIEW_FINANCIAL_SUMMARY) ||
    (userRole === "Admin" && staffPermissions.includes("all"));

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your store operations.</p>
      </div>

      {/* Stats Grid - compact */}
      <div className={stats.length === 5 ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20 group"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground tabular-nums truncate leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-1">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 bg-noise rounded-xl p-4">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatCents(order.subtotalCents)}</p>
                  <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${order.paymentStatus === "PaidInFull" ? "bg-success-soft text-success border-success/20" : "bg-warning-soft text-warning border-warning/20"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            <Link href="/dashboard/notifications" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {notifications.slice(0, 5).map((note) => (
              <div key={note.id} className={`flex items-start gap-3 p-4 ${!note.isRead ? "bg-accent/30" : ""}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  note.type === "order" ? "bg-primary/10 text-primary" :
                  note.type === "payment" ? "bg-success-soft text-success" :
                  note.type === "stock" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{note.message}</p>
                </div>
                {!note.isRead && <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
