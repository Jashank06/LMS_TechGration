import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true },
    })
    const courseIds = enrollments.map((e) => e.courseId)

    const assessments = await db.assessment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          select: {
            id: true,
            points: true,
          },
        },
        attempts: {
          where: { userId: user.id },
          orderBy: { scorePct: "desc" },
          select: {
            id: true,
            scorePct: true,
            earnedMarks: true,
            totalMarks: true,
            passed: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const items = assessments.map((quiz) => {
      const bestAttempt = quiz.attempts[0]
      return {
        id: quiz.id,
        courseId: quiz.courseId,
        courseTitle: quiz.course.title,
        title: quiz.title,
        description: quiz.description,
        timeLimitSec: quiz.timeLimitSec,
        timeLimitMins: Math.round(quiz.timeLimitSec / 60),
        passingPct: quiz.passingPct,
        questionsCount: quiz.questions.length,
        totalPoints: quiz.questions.reduce((acc, q) => acc + q.points, 0),
        hasAttempted: Boolean(bestAttempt),
        bestScorePct: bestAttempt?.scorePct ?? null,
        isPassed: bestAttempt?.passed ?? false,
        attemptsCount: quiz.attempts.length,
      }
    })

    return NextResponse.json({
      success: true,
      assessments: items,
    })
  } catch (error: any) {
    console.error("Student assessments API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load assessments" },
      { status: 500 }
    )
  }
}
