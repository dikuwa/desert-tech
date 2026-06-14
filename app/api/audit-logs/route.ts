import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { Permissions } from "@/lib/permissions";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function getChangedFields(beforeValues: unknown, afterValues: unknown): string[] {
  const before = asRecord(beforeValues);
  const after = asRecord(afterValues);
  if (!before && !after) return [];

  return Array.from(new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ])).filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]));
}

export async function GET() {
  const auth = await authorizePermission(Permissions.AUDIT_LOGS_VIEW);
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ auditLogs: [] });

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  return NextResponse.json(
    {
      auditLogs: logs.map((log) => {
        const metadata = asRecord(log.metadata);
        const changedFields = getChangedFields(log.beforeValues, log.afterValues);
        const hasDetails = metadata || changedFields.length > 0;

        return {
          id: log.id,
          action: log.action,
          entityType: log.targetType.toLowerCase(),
          entityId: log.targetId ?? log.id,
          entityLabel: log.targetLabel ?? log.targetType,
          performedBy: log.actorEmail ?? "System",
          timestamp: log.createdAt.toISOString(),
          details: hasDetails ? { metadata, changedFields } : undefined,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
