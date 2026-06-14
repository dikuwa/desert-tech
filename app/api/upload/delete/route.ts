import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { Permissions, hasPermission } from "@/lib/permissions";
import { deleteFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to delete files." },
      { status: 401 },
    );
  }

  // Require at least one of the edit permissions
  const canDelete = [
    Permissions.PRODUCTS_CREATE,
    Permissions.PRODUCTS_UPDATE,
    Permissions.PROMOTIONS_CREATE,
    Permissions.PROMOTIONS_UPDATE,
    Permissions.SETTINGS_UPDATE,
  ].some((p) => hasPermission(user.role, user.permissions, p));

  if (!canDelete) {
    return NextResponse.json(
      { error: "Permission denied." },
      { status: 403 },
    );
  }

  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body.key) {
    return NextResponse.json(
      { error: "Missing 'key' field." },
      { status: 400 },
    );
  }

  try {
    await deleteFile(body.key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Upload Delete] Failed:", error);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 },
    );
  }
}
