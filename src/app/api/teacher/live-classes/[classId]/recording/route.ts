import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { isStaff } from "@/server/services/teacher-scope"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classId } = await params
    const existing = await db.liveClass.findUnique({
      where: { id: classId },
      include: { course: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const teacher = session.user
    const owns = existing.instructorId === teacher.id || existing.instructorName === teacher.name
    if (!owns && !isStaff(teacher.role)) {
      return NextResponse.json({ error: "This session belongs to another instructor" }, { status: 403 })
    }

    const json = await request.json()
    const rawUrl = typeof json.recordingUrl === "string" ? json.recordingUrl.trim() : null

    if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://") && !rawUrl.startsWith("/")) {
      return NextResponse.json({ error: "Recording URL must start with http://, https://, or /" }, { status: 400 })
    }

    // Auto-mark completed if past end time or if recording is being published
    const newStatus = rawUrl && existing.status === "SCHEDULED" && new Date(existing.endsAt) <= new Date()
      ? "COMPLETED"
      : existing.status

    const updated = await db.liveClass.update({
      where: { id: classId },
      data: {
        recordingUrl: rawUrl || null,
        status: newStatus,
      },
    })

    await logAuditEvent({
      actorId: teacher.id,
      actorEmail: teacher.email || "instructor@techgration.com",
      action: "UPDATE",
      resource: "LIVE_CLASS",
      resourceId: classId,
      details: {
        action: rawUrl ? "ATTACH_RECORDING" : "REMOVE_RECORDING",
        recordingUrl: rawUrl,
        classTitle: existing.title,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: rawUrl ? "Class recording published successfully." : "Recording removed.",
      liveClass: {
        id: updated.id,
        recordingUrl: updated.recordingUrl,
        status: updated.status,
      },
    })
  } catch (error) {
    console.error("Live class recording update error:", error)
    return NextResponse.json({ error: "Failed to update recording" }, { status: 500 })
  }
}
