import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { getTeacherCourseScope } from "@/server/services/teacher-scope"

export async function GET(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized teacher access" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessmentId")

    const courseScope = getTeacherCourseScope(session.user)

    // Find all courses taught by this instructor
    const taughtCourses = await db.course.findMany({
      where: courseScope,
      select: { id: true, title: true },
    })

    const taughtCourseIds = taughtCourses.map((c) => c.id)

    // Build assessment filter
    const assessmentWhere: any = {
      courseId: { in: taughtCourseIds },
    }
    if (assessmentId && assessmentId !== "ALL") {
      assessmentWhere.id = assessmentId
    }

    const assessments = await db.assessment.findMany({
      where: assessmentWhere,
      include: {
        course: { select: { id: true, title: true } },
        questions: { select: { id: true, points: true } },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
          orderBy: { startedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const allSubmissions: any[] = []

    for (const a of assessments) {
      for (const att of a.attempts) {
        allSubmissions.push({
          id: att.id,
          attemptId: att.id,
          assessmentId: a.id,
          assessmentTitle: a.title,
          courseId: a.course.id,
          courseTitle: a.course.title,
          studentId: att.user.id,
          studentName: att.user.name,
          studentEmail: att.user.email,
          studentAvatar: att.user.profile?.avatarUrl,
          submittedAt: att.submittedAt?.toISOString() || att.startedAt.toISOString(),
          mcqMarks: att.mcqMarks,
          codingMarks: att.codingMarks,
          earnedMarks: att.earnedMarks,
          totalMarks: att.totalMarks || 50,
          scorePct: att.scorePct,
          passed: att.passed,
          allowReattempt: att.allowReattempt,
          resultsPublished: a.resultsPublished,
          status: att.status || "SUBMITTED",
        })
      }
    }

    // Sort all submissions by latest submittedAt
    allSubmissions.sort(
      (x, y) => new Date(y.submittedAt).getTime() - new Date(x.submittedAt).getTime()
    )

    return NextResponse.json({
      success: true,
      assessments: assessments.map((a) => ({
        id: a.id,
        title: a.title,
        courseId: a.course.id,
        courseTitle: a.course.title,
        resultsPublished: a.resultsPublished,
        isPublished: a.isPublished,
        timeLimitMinutes: Math.round(a.timeLimitSec / 60),
        questionCount: a.questions.length,
        totalAttempts: a.attempts.length,
      })),
      submissions: allSubmissions,
    })
  } catch (error: any) {
    console.error("Teacher quizzes submissions error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load submissions" },
      { status: 500 }
    )
  }
}
