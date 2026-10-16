import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action") || "ALL"
    const resource = searchParams.get("resource") || "ALL"
    const search = searchParams.get("search") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (action !== "ALL") {
      where.action = action
    }

    if (resource !== "ALL") {
      where.resource = resource
    }

    if (search) {
      where.OR = [
        { actorEmail: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { resource: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search } },
      ]
    }

    const [total, logs] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        actorId: l.actorId,
        actorEmail: l.actorEmail,
        actorRole: l.actorRole,
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        details: l.details,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        createdAt: l.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Audit logs GET error:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
