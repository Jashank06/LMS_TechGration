import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [liveClasses, pastRecordings] = await Promise.all([
      db.liveClass.findMany({
        where: {
          status: { in: ["SCHEDULED", "LIVE"] },
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructor: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { startsAt: "asc" },
        take: 20,
      }),
      db.liveClass.findMany({
        where: {
          OR: [
            { status: "COMPLETED" },
            { recordingUrl: { not: null } },
          ],
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructor: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { startsAt: "desc" },
        take: 30,
      }),
    ])

    return NextResponse.json({
      success: true,
      liveClasses: liveClasses.map((lc) => ({
        id: lc.id,
        title: lc.title,
        description: lc.description,
        courseId: lc.courseId,
        courseTitle: lc.course.title,
        instructorName: lc.instructorName || lc.course.instructor?.name || "Faculty",
        meetingUrl: lc.meetingUrl,
        meetingPlatform: lc.platform,
        status: lc.status,
        startsAt: lc.startsAt,
        durationMinutes: Math.round((lc.endsAt.getTime() - lc.startsAt.getTime()) / (1000 * 60)),
      })),
      recordings: pastRecordings.map((lc) => ({
        id: lc.id,
        title: lc.title,
        description: lc.description,
        courseId: lc.courseId,
        courseTitle: lc.course.title,
        instructorName: lc.instructorName || lc.course.instructor?.name || "Faculty",
        meetingUrl: lc.meetingUrl,
        recordingUrl: lc.recordingUrl,
        meetingPasscode: lc.meetingPasscode,
        meetingPlatform: lc.platform,
        status: lc.status,
        startsAt: lc.startsAt,
        durationMinutes: Math.round((lc.endsAt.getTime() - lc.startsAt.getTime()) / (1000 * 60)),
      })),
    })
  } catch (error: any) {
    console.error("Student live-classes API error:", error)
    return NextResponse.json({ error: error.message || "Failed to load live classes" }, { status: 500 })
  }
}
