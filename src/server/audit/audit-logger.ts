import { db } from "@/server/db"
import { Role } from "@prisma/client"

export interface AuditEventParams {
  actorId?: string
  actorEmail: string
  actorRole?: Role
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Append-only immutable audit logging engine.
 * Writes events directly into the MongoDB audit_logs collection.
 * No delete or update operations are exposed anywhere in the codebase.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details as any,
        ipAddress: params.ipAddress || "127.0.0.1",
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to write immutable audit log:", error)
  }
}
