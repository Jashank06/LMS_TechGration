import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function GET() {
  try {
    await requireAdmin()

    const announcements = await db.announcement.findMany({
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json({ announcements })
  } catch (error: any) {
    console.error("Announcements GET error:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(5, "Body must be at least 5 characters"),
  targetRole: z.enum(["ALL", "STUDENT", "TEACHER"]).default("ALL"),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = announcementSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { title, body: announcementBody, targetRole } = validation.data

    const announcement = await db.announcement.create({
      data: {
        title,
        body: announcementBody,
        targetRole,
        publishedAt: new Date(),
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "ANNOUNCEMENT_BROADCAST",
      resource: "ANNOUNCEMENT",
      resourceId: announcement.id,
      details: { title, targetRole },
      ipAddress,
    })

    return NextResponse.json({ success: true, announcement })
  } catch (error: any) {
    console.error("Announcement POST error:", error)
    return NextResponse.json({ error: "Failed to broadcast announcement" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    await db.announcement.delete({ where: { id } })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "ANNOUNCEMENT_DELETE",
      resource: "ANNOUNCEMENT",
      resourceId: id,
      ipAddress,
    })

    return NextResponse.json({ success: true, message: "Announcement deleted" })
  } catch (error: any) {
    console.error("Announcement DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
}
