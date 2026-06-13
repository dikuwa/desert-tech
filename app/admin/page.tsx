import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/dashboard";

  // Redirect to the new login page
  redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
}
