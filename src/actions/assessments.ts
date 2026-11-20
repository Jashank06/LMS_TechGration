"use server"

import { revalidatePath } from "next/cache"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export interface CodingSubmissionInput {
  problemSlug: string
  problemTitle?: string
  code: string
  testsPassed?: number
  totalTests?: number
  marksAwarded?: number
  output?: string
}

export async function submitQuizAttemptAction(
  assessmentId: string,
  answers: Record<string, string>, // questionId -> selectedOptionId
  codingSubmissions: CodingSubmissionInput[] = []
) {
  const user = await requireStudent()

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  })

  if (!assessment) {
    return { success: false, error: "Assessment not found." }
  }

  const isAuthorizedTester =
    assessment.isPublished ||
    assessment.allowedEmails.includes(user.email) ||
    user.role === "ADMIN" ||
    user.role === "TEACHER"

  if (!isAuthorizedTester) {
    return { success: false, error: "Assessment not found." }
  }

  // Verify active student enrollment in the course
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
    return {
      success: false,
      error: "Active enrollment in this course is required to take this assessment.",
    }
  }

  // Check if student already has a submitted attempt without reattempt permission
  const existingAttempt = await db.assessmentAttempt.findFirst({
    where: {
      assessmentId,
      userId: user.id,
    },
    orderBy: { startedAt: "desc" },
  })

  if (existingAttempt && !existingAttempt.allowReattempt) {
    return {
      success: false,
      error: "You have already completed this evaluation. Reattempts can only be authorized by your course instructor (Vineet Sir).",
    }
  }

  // 1. Calculate Section A: MCQ Marks
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

  // 2. Calculate Section B: Coding Marks (2 Problems × 5 Marks = 10 Marks)
  let codingEarnedMarks = 0
  const codingPossibleMarks = 10

  for (const sub of codingSubmissions) {
    if (sub.marksAwarded !== undefined && sub.marksAwarded !== null) {
      codingEarnedMarks += Math.min(5, Math.max(0, sub.marksAwarded))
    } else if (sub.code && sub.code.trim().length > 20 && sub.output && sub.output.trim().length > 0) {
      // Both code and output provided
      codingEarnedMarks += 5
    } else if (sub.code && sub.code.trim().length > 20) {
      // Basic credit for code until teacher reviews output
      codingEarnedMarks += 3
    }
  }
  codingEarnedMarks = Math.min(codingPossibleMarks, codingEarnedMarks)

  // Combined Totals (40 + 10 = 50 Marks)
  const totalPossibleMarks = mcqPossibleMarks + codingPossibleMarks
  const totalEarned = mcqEarnedMarks + codingEarnedMarks
  const scorePercent =
    totalPossibleMarks > 0 ? Math.round((totalEarned / totalPossibleMarks) * 100) : 0
  const isPassed = scorePercent >= assessment.passingPct

  const attempt = await db.assessmentAttempt.create({
    data: {
      assessmentId,
      userId: user.id,
      scorePct: scorePercent,
      earnedMarks: totalEarned,
      totalMarks: totalPossibleMarks,
      mcqMarks: mcqEarnedMarks,
      codingMarks: codingEarnedMarks,
      codingResponses: codingSubmissions as any,
      allowReattempt: false, // Reset reattempt authorization upon submission
      status: "SUBMITTED",
      passed: isPassed,
      submittedAt: new Date(),
      answers: {
        create: attemptAnswersData,
      },
    },
  })

  revalidatePath(`/student/assessments/${assessmentId}`)
  revalidatePath("/student/assessments")
  revalidatePath("/student/dashboard")
  revalidatePath("/student/leaderboard")
  revalidatePath("/student/rewards")
  if (assessment.courseId) {
    revalidatePath(`/student/courses/${assessment.courseId}`)
    revalidatePath(`/teacher/courses/${assessment.courseId}/assessments`)
  }
  revalidatePath("/teacher/quizzes")

  // If results are NOT published by teacher yet, hide correct answers/explanations
  if (!assessment.resultsPublished) {
    return {
      success: true,
      attemptId: attempt.id,
      resultsPublished: false,
      scorePercent,
      earnedMarks: totalEarned,
      totalPossibleMarks,
      mcqMarks: mcqEarnedMarks,
      codingMarks: codingEarnedMarks,
      message:
        "Assessment submitted successfully. Responses are locked and submitted to your instructor (Vineet Sir). Detailed results and model solutions will be available once results are officially released.",
    }
  }

  // If results ARE published, return the full diagnostic review
  const questionReview = assessment.questions.map((q) => {
    const selectedOptionId = answers[q.id]
    const correctOption = q.options.find((o) => o.isCorrect)
    const isCorrect = Boolean(
      selectedOptionId && correctOption && selectedOptionId === correctOption.id
    )
    return {
      questionId: q.id,
      prompt: q.prompt,
      topic: q.topic,
      explanation: q.explanation,
      points: q.points > 0 ? q.points : 1,
      selectedOptionId: selectedOptionId || null,
      selectedOptionText: q.options.find((o) => o.id === selectedOptionId)?.label || null,
      correctOptionId: correctOption?.id || null,
      correctOptionText: correctOption?.label || null,
      isCorrect,
    }
  })

  return {
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
    review: questionReview,
  }
}
