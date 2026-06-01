import { Card } from "@/components/ui/card";
import { ShoppingBag, Bell, AlertTriangle, DollarSign } from "lucide-react";

const stats = [
  { label: "New Orders", value: "12", icon: ShoppingBag, color: "text-primary" },
  { label: "Pending Follow-ups", value: "8", icon: Bell, color: "text-warning" },
  { label: "Low Stock Items", value: "3", icon: AlertTriangle, color: "text-destructive" },
  { label: "Revenue This Month", value: "N$ 45,000", icon: DollarSign, color: "text-success" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here&apos;s your store overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
        <div className="mt-4 rounded-lg border border-border bg-muted p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No recent orders yet. Orders will appear here once customers start checking out.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h3 className="mt-4 text-sm font-semibold text-foreground">New Order</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a manual order for a customer
          </p>
        </Card>
        <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
          <Bell className="h-8 w-8 text-primary" />
          <h3 className="mt-4 text-sm font-semibold text-foreground">Follow-ups</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            View pending customer follow-ups
          </p>
        </Card>
        <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <h3 className="mt-4 text-sm font-semibold text-foreground">Low Stock</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Review low stock alerts
          </p>
        </Card>
      </div>
    </div>
  );
}
