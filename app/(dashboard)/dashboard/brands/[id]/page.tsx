import { redirect } from "next/navigation";

export default async function BrandRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/categories?tab=brands&brand=${encodeURIComponent(id)}`);
}
