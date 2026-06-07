import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";
import { db } from "@/lib/db";

/**
 * GET /api/dashboard/notifications
 * Fetch recent notifications for the current authenticated user.
 */
export async function GET() {
  const { user, error } = await authorizePermission(Permissions.NOTIFICATIONS_VIEW);
  if (error) return error;

  if (!db) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.warn("[Notifications API] Failed to fetch notifications:", error);
    return NextResponse.json({ notifications: [] });
  }
}
