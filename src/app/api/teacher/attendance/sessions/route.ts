import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { getTeacherLiveClassScope } from "@/server/services/teacher-scope"

export async function GET() {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const liveClasses = await db.liveClass.findMany({
      where: getTeacherLiveClassScope(session.user),
      include: {
        course: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { startsAt: "desc" },
    })

    const sessions = liveClasses.map((s) => ({
      id: s.id,
      title: s.title,
      courseId: s.courseId,
      courseTitle: s.course.title,
      courseCode: s.course.slug.toUpperCase().slice(0, 8),
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      status: s.status,
      enrolledCount: s.course._count.enrollments,
    }))

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Attendance sessions API error:", error)
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 })
  }
}
