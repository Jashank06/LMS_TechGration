import { NextResponse, after } from "next/server"
import { ZodError } from "zod"
import { liveClassCancelSchema } from "@/server/schemas/teacher-schemas"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { isStaff } from "@/server/services/teacher-scope"
import { runDispatch } from "@/server/services/live-class-mailer"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function PUT(
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
    const parsed = liveClassCancelSchema.parse(json)

    // Cancelled classes are ignored by the reminder sweep (it only scans SCHEDULED classes)
    const updated = await db.liveClass.update({
      where: { id: classId },
      data: { status: "CANCELLED" },
    })

    if (parsed.notifyStudents && existing.status !== "CANCELLED") {
      after(async () => {
        try {
          await runDispatch({
            classId,
            kind: "CANCELLED",
            reason: parsed.reason,
            includeTeacherCopy: true,
          })
        } catch (err) {
          console.error("Cancel-mail dispatch failed:", err)
        }
      })
    }

    await logAuditEvent({
      actorId: teacher.id,
      actorEmail: teacher.email,
      actorRole: teacher.role,
      action: "LIVE_CLASS_CANCEL",
      resource: "LIVE_CLASS",
      resourceId: classId,
      details: { reason: parsed.reason, notified: parsed.notifyStudents },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: parsed.notifyStudents
        ? `Session cancelled. Cancellation email is being sent to enrolled learners.`
        : "Session cancelled.",
      session: {
        ...updated,
        startsAt: updated.startsAt.toISOString(),
        endsAt: updated.endsAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid request" }, { status: 400 })
    }
    console.error("Cancel class API error:", error)
    return NextResponse.json({ error: "Failed to cancel class" }, { status: 500 })
  }
}
