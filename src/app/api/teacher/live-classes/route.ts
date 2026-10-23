import { NextResponse, after } from "next/server"
import { ZodError } from "zod"
import { liveClassScheduleSchema } from "@/server/schemas/teacher-schemas"
import { detectScheduleConflict } from "@/server/services/conflict-detector"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { isStaff, getTeacherCourseScope, getTeacherLiveClassScope } from "@/server/services/teacher-scope"
import { validateMeetingUrl } from "@/server/services/meeting-links"
import { DEFAULT_REMINDER_OFFSETS, getOffsets, runDispatch } from "@/server/services/live-class-mailer"
import { buildReminderTimeline, markPastOffsetsSkipped, autoCompleteExpiredClasses } from "@/server/services/reminder-engine"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function GET() {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Auto-transition ended classes to COMPLETED
    await autoCompleteExpiredClasses().catch(() => {})

    const teacher = session.user
    const classScope = getTeacherLiveClassScope(teacher)
    const courseScope = getTeacherCourseScope(teacher)

    const [classesRaw, coursesRaw] = await Promise.all([
      db.liveClass.findMany({
        where: classScope,
        include: {
          course: true,
          dispatches: true,
          _count: { select: { attendances: true } },
        },
        orderBy: { startsAt: "asc" },
      }),
      db.course.findMany({
        where: courseScope,
        select: { id: true, title: true, slug: true },
      }),
    ])

    // Real enrolled counts per course
    const courseIds = Array.from(new Set(classesRaw.map((c) => c.courseId)))
    const enrollmentCounts = await Promise.all(
      courseIds.map(async (courseId) => ({
        courseId,
        count: await db.enrollment.count({ where: { courseId, status: "ACTIVE" } }),
      }))
    )
    const enrolledByCourse = new Map(enrollmentCounts.map((e) => [e.courseId, e.count]))

    const now = new Date()
    const classes = classesRaw.map((c) => {
      const isEnded = c.status === "COMPLETED" || new Date(c.endsAt) < now
      const isLive = !isEnded && (c.status === "LIVE" || (now >= new Date(c.startsAt) && now <= new Date(c.endsAt)))
      const effectiveStatus = isEnded ? "COMPLETED" : isLive ? "LIVE" : c.status

      return {
        id: c.id,
        courseId: c.courseId,
        courseTitle: c.course.title,
        courseCode: c.course.slug.toUpperCase().slice(0, 8),
        title: c.title,
        description: c.description || "",
        instructorName: c.instructorName,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt.toISOString(),
        timezone: c.timezone,
        platform: c.platform,
        meetingUrl: c.meetingUrl,
        status: effectiveStatus,
        enrolledCount: enrolledByCourse.get(c.courseId) ?? 0,
        attendedCount: c._count.attendances,
        reminderOffsetsMin: getOffsets(c),
        joinOpensMinBefore: c.joinOpensMinBefore,
        dispatches: c.dispatches.map((d) => ({
          kind: d.kind,
          offsetMin: d.offsetMin,
          status: d.status,
          recipients: d.recipients,
          sentCount: d.sentCount,
          failedCount: d.failedCount,
          completedAt: d.completedAt ? d.completedAt.toISOString() : null,
        })),
      }
    })

    const courses = coursesRaw.map((c) => ({
      id: c.id,
      title: c.title,
      code: c.slug.toUpperCase().slice(0, 8),
    }))

    return NextResponse.json({ classes, courses })
  } catch (error) {
    console.error("Live classes API error:", error)
    return NextResponse.json({ error: "Failed to load live classes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const parsed = liveClassScheduleSchema.parse(json)
    const teacher = session.user

    const startsAt = new Date(parsed.startsAt)
    const endsAt = new Date(parsed.endsAt)
    if (endsAt <= startsAt) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }
    if (startsAt <= new Date()) {
      return NextResponse.json({ error: "Class start time must be in the future" }, { status: 400 })
    }

    // Course ownership — a teacher can only schedule for courses mapped to them
    const course = await db.course.findFirst({
      where: {
        id: parsed.courseId,
        ...getTeacherCourseScope(teacher),
      },
    })
    if (!course) {
      const exists = await db.course.findUnique({ where: { id: parsed.courseId }, select: { id: true } })
      if (!exists) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "This course is not assigned to you" }, { status: 403 })
    }

    const link = validateMeetingUrl(parsed.platform, parsed.meetingUrl)
    if (!link.ok) {
      return NextResponse.json({ error: link.error }, { status: 400 })
    }

    const existingSessions = await db.liveClass.findMany({
      where: getTeacherLiveClassScope(teacher),
      include: { course: true },
    })

    const conflictResult = detectScheduleConflict({
      sessions: existingSessions.map((s) => ({
        id: s.id,
        courseId: s.courseId,
        courseTitle: s.course.title,
        instructorName: s.instructorName,
        title: s.title,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        status: s.status as any,
      })),
      proposedStartsAt: parsed.startsAt,
      proposedEndsAt: parsed.endsAt,
      courseId: parsed.courseId,
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

    const offsets = parsed.reminderOffsetsMin?.length ? parsed.reminderOffsetsMin : DEFAULT_REMINDER_OFFSETS

    const newSession = await db.liveClass.create({
      data: {
        courseId: parsed.courseId,
        title: parsed.title,
        description: parsed.description,
        instructorName: teacher.name,
        instructorId: teacher.id,
        startsAt,
        endsAt,
        timezone: parsed.timezone,
        platform: parsed.platform,
        meetingUrl: link.url!,
        reminderOffsetsMin: offsets,
        joinOpensMinBefore: parsed.joinOpensMinBefore ?? 10,
        status: "SCHEDULED",
      },
    })

    // Smart-skip reminders whose time has already passed (e.g. 30-min offset for a class in 20 min)
    const skippedOffsets = await markPastOffsetsSkipped(newSession)

    // Mails are sent after the response so the teacher UI stays instant
    after(async () => {
      try {
        await runDispatch({ classId: newSession.id, kind: "SCHEDULED", includeTeacherCopy: true })
      } catch (err) {
        console.error("Scheduled-mail dispatch failed:", err)
      }
    })

    const enrolledCount = await db.enrollment.count({ where: { courseId: parsed.courseId, status: "ACTIVE" } })

    await logAuditEvent({
      actorId: teacher.id,
      actorEmail: teacher.email,
      actorRole: teacher.role,
      action: "LIVE_CLASS_SCHEDULE",
      resource: "LIVE_CLASS",
      resourceId: newSession.id,
      details: { title: newSession.title, courseId: newSession.courseId, platform: newSession.platform, offsets },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
    }).catch(() => {})

    return NextResponse.json(
      {
        success: true,
        skippedOffsets,
        timeline: buildReminderTimeline(startsAt, offsets).map((t) => ({
          offsetMin: t.offsetMin,
          at: t.at.toISOString(),
          willSend: t.willSend,
        })),
        liveClass: {
          id: newSession.id,
          courseId: newSession.courseId,
          courseTitle: course.title,
          courseCode: course.slug.toUpperCase().slice(0, 8),
          title: newSession.title,
          description: newSession.description,
          instructorName: newSession.instructorName,
          startsAt: newSession.startsAt.toISOString(),
          endsAt: newSession.endsAt.toISOString(),
          timezone: newSession.timezone,
          platform: newSession.platform,
          meetingUrl: newSession.meetingUrl,
          status: newSession.status,
          enrolledCount,
          reminderOffsetsMin: offsets,
          joinOpensMinBefore: newSession.joinOpensMinBefore,
          dispatches: [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid live class data" },
        { status: 400 }
      )
    }
    console.error("Create live class API error:", error)
    return NextResponse.json({ error: "Failed to schedule live class" }, { status: 500 })
  }
}
