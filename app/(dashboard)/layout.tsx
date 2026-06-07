import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardNotificationPoller } from "@/components/dashboard/notification-poller";
import { requireAuth } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { ProductSync } from "@/components/product-sync";
import { CatalogSync } from "@/components/catalog-sync";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="dashboard-shell flex min-h-screen">
      <DashboardNotificationPoller />
      <ProductSync />
      <CatalogSync importLocal />
      <DashboardSidebar
        user={{
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        }}
      />
      <main className="dashboard-main flex-1 overflow-auto bg-muted bg-noise">
        <div className="dashboard-content p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
