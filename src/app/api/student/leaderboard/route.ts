import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { getCourseLeaderboard } from "@/server/services/leaderboard"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestedCourseId = searchParams.get("courseId")

    // Fetch student's active enrollments to get available courses
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { lastAccessedAt: "desc" },
    })

    if (enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        courses: [],
        activeCourse: null,
        ranked: [],
        waiting: [],
        stats: { enrolled: 0, ranked: 0, topMarks: 0, averageMarks: 0 },
      })
    }

    const courses = enrollments.map((e) => ({ id: e.course.id, title: e.course.title }))
    let activeId = courses[0].id

    if (requestedCourseId && courses.some((c) => c.id === requestedCourseId)) {
      activeId = requestedCourseId
    }

    const data = await getCourseLeaderboard(activeId, { id: user.id, isStaff: false })

    return NextResponse.json({
      success: true,
      courses,
      activeCourse: data?.course || courses[0],
      ranked: data?.ranked || [],
      waiting: data?.waiting || [],
      stats: data?.stats || { enrolled: 0, ranked: 0, topMarks: 0, averageMarks: 0 },
    })
  } catch (error: any) {
    console.error("Student leaderboard API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load leaderboard" },
      { status: 500 }
    )
  }
}
