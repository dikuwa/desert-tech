/**
 * Server-side notification utilities for creating dashboard notifications.
 * These are safe to call from API routes — they write to the database so
 * the dashboard's polling mechanism can pick them up.
 */

import { db } from "@/lib/db";

export interface CreateNotificationInput {
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Create a dashboard notification for the first active admin/owner user.
 * Used by public-facing API routes (storefront orders, back-in-stock requests)
 * where there is no authenticated dashboard user.
 */
export async function createSystemNotification(input: CreateNotificationInput) {
  if (!db) {
    console.log("[Notification]", input.type, input.title, input.message);
    return;
  }

  // Find the first active admin/owner to notify
  const admin = await db.user.findFirst({
    where: {
      role: { in: ["OWNER", "ADMIN"] },
      status: "ACTIVE",
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!admin) return;

  try {
    await db.notification.create({
      data: {
        userId: admin.id,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityType: input.relatedEntityType ?? null,
        relatedEntityId: input.relatedEntityId ?? null,
      },
    });
  } catch (error) {
    console.warn("[Notification] Failed to create notification:", error);
  }
}

/**
 * Create a dashboard notification for a specific user.
 * Used by authenticated API routes where the user is known.
 */
export async function createUserNotification(
  userId: string,
  input: CreateNotificationInput,
) {
  if (!db) {
    console.log("[Notification]", input.type, input.title, input.message);
    return;
  }

  try {
    await db.notification.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityType: input.relatedEntityType ?? null,
        relatedEntityId: input.relatedEntityId ?? null,
      },
    });
  } catch (error) {
    console.warn("[Notification] Failed to create notification:", error);
  }
}
