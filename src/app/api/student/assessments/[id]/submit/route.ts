import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const answers: Record<string, string> = body.answers || {}

    const assessment = await db.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })

    if (!assessment) {
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
        { error: "Active enrollment in this course is required to submit this assessment." },
        { status: 403 }
      )
    }

    const totalQuestions = assessment.questions.length
    let correctCount = 0
    let totalPossibleMarks = 0
    let earnedMarks = 0

    const attemptAnswersData: Array<{
      questionId: string
      selectedOptionIds: string[]
      isCorrect: boolean
      pointsAwarded: number
    }> = []

    for (const question of assessment.questions) {
      const qPoints = question.points > 0 ? question.points : 10
      totalPossibleMarks += qPoints

      const selectedOptionId = answers[question.id]
      const correctOption = question.options.find((o) => o.isCorrect)

      const isCorrect = Boolean(
        selectedOptionId && correctOption && selectedOptionId === correctOption.id
      )

      const awarded = isCorrect ? qPoints : 0
      if (isCorrect) {
        correctCount++
        earnedMarks += awarded
      }

      if (selectedOptionId) {
        attemptAnswersData.push({
          questionId: question.id,
          selectedOptionIds: [selectedOptionId],
          isCorrect,
          pointsAwarded: awarded,
        })
      }
    }

    const scorePercent =
      totalPossibleMarks > 0
        ? Math.round((earnedMarks / totalPossibleMarks) * 100)
        : totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0

    const isPassed = scorePercent >= assessment.passingPct

    const attempt = await db.assessmentAttempt.create({
      data: {
        assessmentId: id,
        userId: user.id,
        scorePct: scorePercent,
        earnedMarks,
        totalMarks: totalPossibleMarks,
        passed: isPassed,
        answers: {
          create: attemptAnswersData,
        },
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      scorePercent,
      isPassed,
      correctCount,
      totalQuestions,
      earnedMarks,
      totalPossibleMarks,
      attemptId: attempt.id,
      passingPct: assessment.passingPct,
    })
  } catch (error: any) {
    console.error("Student assessment submit API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit assessment" },
      { status: 500 }
    )
  }
}
