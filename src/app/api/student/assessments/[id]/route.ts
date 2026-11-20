import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Assessment ID required" }, { status: 400 })
    }

    const assessment = await db.assessment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            prompt: true,
            points: true,
            position: true,
            topic: true,
            explanation: true,
            options: {
              select: {
                id: true,
                label: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const isAuthorizedTester =
      assessment.isPublished ||
      assessment.allowedEmails.includes(user.email) ||
      user.role === "ADMIN" ||
      user.role === "TEACHER"

    if (!isAuthorizedTester) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Verify student is enrolled in this course
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: assessment.courseId,
        },
      },
      select: { status: true },
    })

    if (!enrollment || (enrollment.status !== "ACTIVE" && enrollment.status !== "COMPLETED")) {
      return NextResponse.json(
        { error: "Active enrollment in this course is required to take evaluations." },
        { status: 403 }
      )
    }

    const latestAttempt = await db.assessmentAttempt.findFirst({
      where: {
        assessmentId: id,
        userId: user.id,
      },
      orderBy: { startedAt: "desc" },
      include: {
        answers: true,
      },
    })

    const isResultsPublished = Boolean(assessment.resultsPublished)

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description || "",
        courseId: assessment.courseId,
        courseTitle: assessment.course.title,
        timeLimitSec: assessment.timeLimitSec,
        timeLimitMinutes: Math.round(assessment.timeLimitSec / 60),
        passingScorePercent: assessment.passingPct,
        isPublished: assessment.isPublished,
        isPrivateBeta: !assessment.isPublished,
        resultsPublished: isResultsPublished,
        latestAttempt: latestAttempt
          ? {
              id: latestAttempt.id,
              submittedAt: latestAttempt.submittedAt?.toISOString() || null,
              scorePct: latestAttempt.scorePct,
              earnedMarks: latestAttempt.earnedMarks,
              totalMarks: latestAttempt.totalMarks,
              mcqMarks: latestAttempt.mcqMarks,
              codingMarks: latestAttempt.codingMarks,
              allowReattempt: latestAttempt.allowReattempt,
              passed: latestAttempt.passed,
              codingResponses: latestAttempt.codingResponses,
              selectedAnswers: latestAttempt.answers.reduce((acc, ans) => {
                if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) {
                  acc[ans.questionId] = ans.selectedOptionIds[0]
                }
                return acc
              }, {} as Record<string, string>),
            }
          : null,
        questions: assessment.questions.map((q) => {
          const correctOption = isResultsPublished
            ? q.options.find((o) => o.isCorrect)
            : null

          return {
            id: q.id,
            prompt: q.prompt,
            points: q.points > 0 ? q.points : 1,
            position: q.position,
            topic: q.topic,
            explanation: isResultsPublished ? q.explanation : null,
            correctOptionId: correctOption?.id || null,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.label,
              ...(isResultsPublished ? { isCorrect: o.isCorrect } : {}),
            })),
          }
        }),
      },
    })
  } catch (error: any) {
    console.error("Student assessment detail API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load assessment" },
      { status: 500 }
    )
  }
}
