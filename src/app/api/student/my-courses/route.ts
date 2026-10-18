import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rawEnrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
            modules: {
              orderBy: { position: "asc" },
              include: {
                lessons: {
                  orderBy: { position: "asc" },
                  include: {
                    progress: {
                      where: { userId: user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    })

    // Prioritize "Artificial Intelligence" course
    const enrollments = [...rawEnrollments].sort((a, b) => {
      const isAiA =
        a.course.id === "6ad283b4e196d0b8fbfb9eae" ||
        a.course.title.toLowerCase().includes("artificial intelligence")
      const isAiB =
        b.course.id === "6ad283b4e196d0b8fbfb9eae" ||
        b.course.title.toLowerCase().includes("artificial intelligence")

      if (isAiA && !isAiB) return -1
      if (!isAiA && isAiB) return 1
      return 0
    })

    return NextResponse.json({
      success: true,
      courses: enrollments.map((e) => ({
        enrollmentId: e.id,
        courseId: e.courseId,
        title: e.course.title,
        description: e.course.description,
        thumbnailUrl: e.course.thumbnailUrl,
        level: e.course.level,
        progressPct: e.progressPct,
        instructorName: e.course.instructor?.name || "Faculty",
        modulesCount: e.course.modules.length,
        lessonsCount: e.course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
        modules: e.course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          position: m.position,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            duration: l.durationSec,
            isCompleted: l.progress.length > 0 && l.progress[0].status === "COMPLETED",
          })),
        })),
      })),
    })
  } catch (error: any) {
    console.error("Student my-courses API error:", error)
    return NextResponse.json({ error: error.message || "Failed to load courses" }, { status: 500 })
  }
}
