import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classId } = await params
    const liveClass = await db.liveClass.findUnique({
      where: { id: classId },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                user: {
                  include: { profile: true },
                },
              },
            },
          },
        },
        attendances: true,
      },
    })

    if (!liveClass) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Build roster from enrolled students
    const roster = liveClass.course.enrollments.map((enr) => {
      const existingRecord = liveClass.attendances.find((a) => a.userId === enr.userId)
      return {
        userId: enr.userId,
        name: enr.user.name,
        email: enr.user.email,
        avatarUrl: enr.user.profile?.avatarUrl || "/brand/avatar-default.png",
        status: existingRecord ? existingRecord.status : "PRESENT",
        markedAt: existingRecord ? existingRecord.markedAt.toISOString() : liveClass.startsAt.toISOString(),
      }
    })

    const presentCount = roster.filter((r) => r.status === "PRESENT").length
    const absentCount = roster.filter((r) => r.status === "ABSENT").length
    const lateCount = roster.filter((r) => r.status === "LATE").length
    const excusedCount = roster.filter((r) => r.status === "EXCUSED").length
    const total = roster.length

    return NextResponse.json({
      session: {
        id: liveClass.id,
        courseId: liveClass.courseId,
        courseTitle: liveClass.course.title,
        courseCode: liveClass.course.slug.toUpperCase().slice(0, 8),
        title: liveClass.title,
        description: liveClass.description,
        instructorName: liveClass.instructorName,
        startsAt: liveClass.startsAt.toISOString(),
        endsAt: liveClass.endsAt.toISOString(),
        status: liveClass.status,
      },
      roster,
      analytics: {
        total,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        presentPct: total > 0 ? Math.round((presentCount / total) * 100) : 0,
        punctualityPct: total > 0 ? Math.round(((presentCount + excusedCount) / total) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("Attendance roster API error:", error)
    return NextResponse.json({ error: "Failed to load roster" }, { status: 500 })
  }
}
