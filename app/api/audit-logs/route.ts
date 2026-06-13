import { NextResponse } from "next/server";
import { authorizePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { Permissions } from "@/lib/permissions";

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
      auditLogs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.targetType.toLowerCase(),
        entityId: log.targetId ?? log.id,
        entityLabel: log.targetLabel ?? log.targetType,
        performedBy: log.actorEmail ?? "System",
        timestamp: log.createdAt.toISOString(),
        details: log.metadata ? JSON.stringify(log.metadata) : undefined,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
