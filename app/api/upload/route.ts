import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { Permissions, hasPermission, type Permission } from "@/lib/permissions";
import { uploadFile } from "@/lib/storage";

/**
 * Map of upload context to required permissions.
 * A user needs ANY of the listed permissions for a given context.
 */
const CONTEXT_PERMISSIONS: Record<string, Permission[]> = {
  product: [Permissions.PRODUCTS_CREATE, Permissions.PRODUCTS_UPDATE],
  promotion: [Permissions.PROMOTIONS_CREATE, Permissions.PROMOTIONS_UPDATE],
  settings: [Permissions.SETTINGS_UPDATE],
};

const DEFAULT_PERMISSIONS: Permission[] = [Permissions.PRODUCTS_CREATE, Permissions.PRODUCTS_UPDATE];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to upload files." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Could not read form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Select an image file to upload." },
      { status: 400 },
    );
  }

  // Context-aware permission check
  const context = (formData.get("context") as string | null) || "product";

  // Profile context bypass — any authenticated user can upload their own avatar
  if (context === "profile") {
    // Allow all authenticated users for profile images
  } else {
    const requiredPermissions = CONTEXT_PERMISSIONS[context] ?? DEFAULT_PERMISSIONS;
    const canUpload = requiredPermissions.some((p) =>
      hasPermission(user.role, user.permissions, p),
    );
    if (!canUpload) {
      const contextLabel = context.charAt(0).toUpperCase() + context.slice(1);
      return NextResponse.json(
        { error: `Permission denied. You need ${contextLabel.toLowerCase()}-related permissions to upload images here.` },
        { status: 403 },
      );
    }
  }

  // Validate file presence & name
  const originalName = file.name || "unnamed";
  if (!originalName || originalName === "unnamed") {
    return NextResponse.json(
      { error: "File must have a name." },
      { status: 400 },
    );
  }

  // Validate file type by MIME
  if (!ALLOWED_TYPES.includes(file.type as any)) {
    return NextResponse.json(
      {
        error: `"${originalName}" has an unsupported file type (${file.type || "unknown"}). Allowed: JPEG, PNG, WebP, GIF.`,
      },
      { status: 400 },
    );
  }

  // Validate file extension as a secondary check
  const ext = originalName.toLowerCase().split(".").pop() || "";
  if (!ALLOWED_EXTENSIONS.includes(`.${ext}` as any)) {
    return NextResponse.json(
      {
        error: `"${originalName}" has an unsupported extension (.${ext}). Allowed: .jpg, .jpeg, .png, .webp, .gif.`,
      },
      { status: 400 },
    );
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      {
        error: `"${originalName}" is ${sizeMB} MB, which exceeds the 5 MB limit. Compress or choose a smaller image.`,
      },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: `"${originalName}" is empty (0 bytes). Choose a valid image file.` },
      { status: 400 },
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename preserving the original extension
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const uploadResult = await uploadFile(
      buffer,
      `images/${filename}`,
      file.type,
    );

    return NextResponse.json({
      url: uploadResult.url,
      filename,
      key: uploadResult.key,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Upload] Failed to save file:", message);
    return NextResponse.json(
      {
        error: `Could not save "${originalName}". The server encountered an error while writing the file. Please try again.`,
      },
      { status: 500 },
    );
  }
}
