import { NextResponse, after } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { getTeacherCourseScope } from "@/server/services/teacher-scope"
import { validateMeetingUrl } from "@/server/services/meeting-links"
import { MeetingPlatform, LiveClassStatus } from "@prisma/client"
import { runDispatch } from "@/server/services/live-class-mailer"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        ...getTeacherCourseScope(session.user),
      },
    })

    if (!course) {
      const exists = await db.course.findUnique({ where: { id: courseId }, select: { id: true } })
      if (!exists) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "This course is not assigned to you" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      startsAt,
      endsAt,
      meetingUrl,
      meetingId,
      meetingPasscode,
      platform,
      notifyStudents = true,
    } = body

    if (!title || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 }
      )
    }

    const startDate = new Date(startsAt)
    const endDate = new Date(endsAt)

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      )
    }

    const selectedPlatform =
      platform === "ZOOM"
        ? MeetingPlatform.ZOOM
        : platform === "GOOGLE_MEET"
        ? MeetingPlatform.GOOGLE_MEET
        : platform === "TEAMS"
        ? MeetingPlatform.TEAMS
        : MeetingPlatform.CUSTOM

    const rawUrl = meetingUrl && meetingUrl.trim()
      ? meetingUrl.trim()
      : "https://us06web.zoom.us/j/89248109283?pwd=TG2026"

    const link = validateMeetingUrl(selectedPlatform, rawUrl)
    if (!link.ok) {
      return NextResponse.json({ error: link.error }, { status: 400 })
    }

    const liveClass = await db.liveClass.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        instructorName: session.user.name || course.instructorName || "Vineet Sir",
        instructorId: session.user.id,
        startsAt: startDate,
        endsAt: endDate,
        timezone: "Asia/Kolkata",
        meetingUrl: link.url!,
        meetingId: meetingId?.trim() || null,
        meetingPasscode: meetingPasscode?.trim() || null,
        platform: selectedPlatform,
        status: LiveClassStatus.SCHEDULED,
      },
    })

    // Asynchronously notify all enrolled students via email (.ics calendar attachment) and in-app notifications
    if (notifyStudents) {
      after(async () => {
        try {
          // runDispatch handles email delivery + in-app notification dispatch in a single clean pass
          await runDispatch({ classId: liveClass.id, kind: "SCHEDULED", includeTeacherCopy: true }).catch((e) =>
            console.error("Scheduled email dispatch error:", e)
          )
        } catch (err) {
          console.error("Async live class notification error:", err)
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Live class scheduled successfully and learners notified!",
      liveClass: {
        ...liveClass,
        startsAt: liveClass.startsAt.toISOString(),
        endsAt: liveClass.endsAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Create live class error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to schedule live class" },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const classes = await db.liveClass.findMany({
      where: { courseId },
      orderBy: { startsAt: "desc" },
    })

    return NextResponse.json({ classes })
  } catch (error: any) {
    console.error("Get live classes error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch live classes" },
      { status: 500 }
    )
  }
}
