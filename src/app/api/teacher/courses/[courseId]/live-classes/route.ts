import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { MeetingPlatform, LiveClassStatus } from "@prisma/client"

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
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, startsAt, endsAt, meetingUrl, platform } = body

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

    const defaultUrl = meetingUrl && meetingUrl.trim()
      ? meetingUrl.trim()
      : "https://meet.google.com/jan-hnzk-nhf"

    const selectedPlatform =
      platform === "ZOOM"
        ? MeetingPlatform.ZOOM
        : platform === "TEAMS"
        ? MeetingPlatform.TEAMS
        : MeetingPlatform.GOOGLE_MEET

    const liveClass = await db.liveClass.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        instructorName: session.user.name || course.instructorName || "Jay Kumar",
        instructorId: session.user.id,
        startsAt: startDate,
        endsAt: endDate,
        timezone: "Asia/Kolkata",
        meetingUrl: defaultUrl,
        platform: selectedPlatform,
        status: LiveClassStatus.SCHEDULED,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Live class scheduled successfully!",
      liveClass: {
        ...liveClass,
        startsAt: liveClass.startsAt.toISOString(),
        endsAt: liveClass.endsAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Create live class error:", error)
    return NextResponse.json(
      { error: "Failed to schedule live class" },
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
      orderBy: { startsAt: "asc" },
    })

    return NextResponse.json({
      classes: classes.map((c) => ({
        ...c,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Get live classes error:", error)
    return NextResponse.json(
      { error: "Failed to get live classes" },
      { status: 500 }
    )
  }
}
