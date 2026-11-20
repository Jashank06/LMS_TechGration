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
    const codingSubmissions: any[] = body.codingSubmissions || []

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
        { error: "Active enrollment in this course is required to submit this assessment." },
        { status: 403 }
      )
    }

    // Verify if student already has a submitted attempt without reattempt permission
    const existingAttempt = await db.assessmentAttempt.findFirst({
      where: {
        assessmentId: id,
        userId: user.id,
      },
      orderBy: { startedAt: "desc" },
    })

    if (existingAttempt && !existingAttempt.allowReattempt) {
      return NextResponse.json(
        {
          error: "You have already completed this evaluation. Reattempts can only be authorized by your course instructor (Vineet Sir).",
        },
        { status: 400 }
      )
    }

    let mcqCorrectCount = 0
    let mcqEarnedMarks = 0
    let mcqPossibleMarks = 0

    const attemptAnswersData: Array<{
      questionId: string
      selectedOptionIds: string[]
      isCorrect: boolean
      pointsAwarded: number
    }> = []

    for (const question of assessment.questions) {
      const qPoints = question.points > 0 ? question.points : 1
      mcqPossibleMarks += qPoints

      const selectedOptionId = answers[question.id]
      const correctOption = question.options.find((o) => o.isCorrect)

      const isCorrect = Boolean(
        selectedOptionId && correctOption && selectedOptionId === correctOption.id
      )

      const awarded = isCorrect ? qPoints : 0
      if (isCorrect) {
        mcqCorrectCount++
        mcqEarnedMarks += awarded
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

    // Coding Marks calculation (2 problems × 5 marks = 10 marks)
    let codingEarnedMarks = 0
    const codingPossibleMarks = 10

    for (const sub of codingSubmissions) {
      if (sub.marksAwarded !== undefined && sub.marksAwarded !== null) {
        codingEarnedMarks += Math.min(5, Math.max(0, sub.marksAwarded))
      } else if (sub.code && sub.code.trim().length > 20 && sub.output && sub.output.trim().length > 0) {
        codingEarnedMarks += 5
      } else if (sub.code && sub.code.trim().length > 20) {
        codingEarnedMarks += 3
      }
    }
    codingEarnedMarks = Math.min(codingPossibleMarks, codingEarnedMarks)

    const totalPossibleMarks = mcqPossibleMarks + codingPossibleMarks
    const totalEarned = mcqEarnedMarks + codingEarnedMarks
    const scorePercent =
      totalPossibleMarks > 0 ? Math.round((totalEarned / totalPossibleMarks) * 100) : 0
    const isPassed = scorePercent >= assessment.passingPct

    const attempt = await db.assessmentAttempt.create({
      data: {
        assessmentId: id,
        userId: user.id,
        scorePct: scorePercent,
        earnedMarks: totalEarned,
        totalMarks: totalPossibleMarks,
        mcqMarks: mcqEarnedMarks,
        codingMarks: codingEarnedMarks,
        codingResponses: codingSubmissions,
        allowReattempt: false,
        status: "SUBMITTED",
        passed: isPassed,
        submittedAt: new Date(),
        answers: {
          create: attemptAnswersData,
        },
      },
    })

    if (!assessment.resultsPublished) {
      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        resultsPublished: false,
        scorePercent,
        earnedMarks: totalEarned,
        totalPossibleMarks,
        mcqMarks: mcqEarnedMarks,
        codingMarks: codingEarnedMarks,
        message:
          "Assessment submitted successfully. Responses are locked and submitted to your instructor (Vineet Sir). Results will be available once published.",
      })
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      resultsPublished: true,
      scorePercent,
      isPassed,
      correctCount: mcqCorrectCount,
      totalQuestions: assessment.questions.length,
      earnedMarks: totalEarned,
      totalPossibleMarks,
      mcqMarks: mcqEarnedMarks,
      codingMarks: codingEarnedMarks,
    })
  } catch (error: any) {
    console.error("Student assessment submit API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit assessment" },
      { status: 500 }
    )
  }
}
