import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { ProgressStatus } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: lessonId } = await params
    const body = await req.json().catch(() => ({}))
    const { status = "COMPLETED", positionSec = 0 } = body

    const progressStatus = status === "COMPLETED" ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS

    // 1. Upsert Lesson Progress
    const progress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      create: {
        userId: user.id,
        lessonId,
        status: progressStatus,
        positionSec,
        completedAt: progressStatus === ProgressStatus.COMPLETED ? new Date() : null,
      },
      update: {
        status: progressStatus,
        positionSec,
        completedAt: progressStatus === ProgressStatus.COMPLETED ? new Date() : null,
      },
    })

    // 2. Fetch the course containing this lesson
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: {
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (lesson?.module?.course) {
      const course = lesson.module.course
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
      const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))

      const completedCount = await db.lessonProgress.count({
        where: {
          userId: user.id,
          lessonId: { in: allLessonIds },
          status: ProgressStatus.COMPLETED,
        },
      })

      const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      // Update enrollment progress percentage
      await db.enrollment.updateMany({
        where: {
          userId: user.id,
          courseId: course.id,
        },
        data: {
          progressPct,
          lastAccessedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Lesson progress saved!",
      progress: {
        lessonId: progress.lessonId,
        status: progress.status,
      },
    })
  } catch (error: any) {
    console.error("Lesson progress error:", error)
    return NextResponse.json({ error: error.message || "Failed to update lesson progress" }, { status: 500 })
  }
}
