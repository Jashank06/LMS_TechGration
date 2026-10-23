import { NextResponse, after } from "next/server"
import { liveClassRescheduleSchema } from "@/server/schemas/teacher-schemas"
import { detectScheduleConflict } from "@/server/services/conflict-detector"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { isStaff, getTeacherLiveClassScope } from "@/server/services/teacher-scope"
import { runDispatch } from "@/server/services/live-class-mailer"
import { markPastOffsetsSkipped } from "@/server/services/reminder-engine"
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
    const parsed = liveClassRescheduleSchema.parse(json)

    if (new Date(parsed.endsAt) <= new Date(parsed.startsAt)) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }
    if (new Date(parsed.startsAt) <= new Date()) {
      return NextResponse.json({ error: "New start time must be in the future" }, { status: 400 })
    }

    // Check conflict excluding this session
    const allSessions = await db.liveClass.findMany({
      where: getTeacherLiveClassScope(teacher),
      include: { course: true },
    })

    const mapped = allSessions.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      courseTitle: s.course.title,
      instructorName: s.instructorName,
      title: s.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      status: s.status as any,
    }))

    const conflictResult = detectScheduleConflict({
      sessions: mapped,
      proposedStartsAt: parsed.startsAt,
      proposedEndsAt: parsed.endsAt,
      courseId: existing.courseId,
      excludeSessionId: existing.id,
    })

    if (conflictResult.hasConflict) {
      return NextResponse.json(
        {
          error: "Schedule conflict detected",
          conflictType: conflictResult.conflictType,
          message: conflictResult.message,
          conflictingSessions: conflictResult.conflictingSessions,
        },
        { status: 409 }
      )
    }

    const oldStartsAt = existing.startsAt

    // Old reminder history no longer applies to the new time -> reset the timeline
    await db.reminderDispatch.deleteMany({ where: { liveClassId: classId } })

    const updated = await db.liveClass.update({
      where: { id: classId },
      data: {
        startsAt: new Date(parsed.startsAt),
        endsAt: new Date(parsed.endsAt),
        status: "SCHEDULED",
      },
    })

    await markPastOffsetsSkipped(updated)

    if (parsed.notifyStudents) {
      after(async () => {
        try {
          await runDispatch({
            classId,
            kind: "RESCHEDULED",
            oldStartsAt,
            reason: parsed.reason,
            includeTeacherCopy: true,
          })
        } catch (err) {
          console.error("Reschedule-mail dispatch failed:", err)
        }
      })
    }

    await logAuditEvent({
      actorId: teacher.id,
      actorEmail: teacher.email,
      actorRole: teacher.role,
      action: "LIVE_CLASS_RESCHEDULE",
      resource: "LIVE_CLASS",
      resourceId: classId,
      details: { from: oldStartsAt.toISOString(), to: updated.startsAt.toISOString(), reason: parsed.reason },
    }).catch(() => {})

    const enrolledCount = await db.enrollment.count({
      where: { courseId: existing.courseId, status: "ACTIVE" },
    })

    return NextResponse.json({
      success: true,
      enrolledCount,
      message: parsed.notifyStudents
        ? `Class rescheduled successfully! Announcement email sent to ${enrolledCount} enrolled learner(s).`
        : "Session rescheduled.",
      session: {
        ...updated,
        startsAt: updated.startsAt.toISOString(),
        endsAt: updated.endsAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Reschedule API error:", error)
    return NextResponse.json({ error: "Failed to reschedule" }, { status: 500 })
  }
}
