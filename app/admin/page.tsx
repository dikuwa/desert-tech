import { AdminAuthCard } from "@/components/auth/admin-auth-card";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/dashboard";

  return (
    <AdminAuthCard
      initialMode={params.mode === "signup" ? "signup" : "signin"}
      redirectTo={redirectTo}
    />
  );
}
