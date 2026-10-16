import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { AVAILABLE_PERMISSIONS } from "@/server/rbac/permissions"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    await requireAdmin()

    const allRecords = await db.rolePermission.findMany()

    // Build matrix mapping: { [role]: { [permission]: boolean } }
    const matrix: Record<string, Record<string, boolean>> = {
      STUDENT: {},
      TEACHER: {},
      ADMIN: {},
      SUPER_ADMIN: {},
    }

    // Default Super Admin is always true
    for (const p of AVAILABLE_PERMISSIONS) {
      matrix.SUPER_ADMIN[p.key] = true
    }

    for (const r of allRecords) {
      if (matrix[r.role]) {
        matrix[r.role][r.permission] = r.granted
      }
    }

    return NextResponse.json({
      permissions: AVAILABLE_PERMISSIONS,
      roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN],
      matrix,
    })
  } catch (error: any) {
    console.error("RBAC GET error:", error)
    return NextResponse.json({ error: "Failed to fetch permission matrix" }, { status: 500 })
  }
}

const updateRbacSchema = z.object({
  updates: z.array(
    z.object({
      role: z.nativeEnum(Role),
      permission: z.string(),
      granted: z.boolean(),
    })
  ),
})

export async function PUT(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = updateRbacSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid updates format" }, { status: 400 })
    }

    const { updates } = validation.data

    // Filter out any attempt to revoke Super Admin permissions
    const validUpdates = updates.filter((u) => u.role !== Role.SUPER_ADMIN)

    for (const item of validUpdates) {
      await db.rolePermission.upsert({
        where: {
          role_permission: {
            role: item.role,
            permission: item.permission,
          },
        },
        update: { granted: item.granted },
        create: {
          role: item.role,
          permission: item.permission,
          granted: item.granted,
        },
      })
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "RBAC_PERMISSIONS_UPDATE",
      resource: "RBAC",
      details: { updatedCount: validUpdates.length },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${validUpdates.length} role permissions`,
    })
  } catch (error: any) {
    console.error("RBAC PUT error:", error)
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 })
  }
}
