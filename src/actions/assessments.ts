"use server"

import { revalidatePath } from "next/cache"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export async function submitQuizAttemptAction(
  assessmentId: string,
  answers: Record<string, string> // questionId -> selectedOptionId
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
    return { success: false, error: "Assessment not found" }
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

  await db.assessmentAttempt.create({
    data: {
      assessmentId,
      userId: user.id,
      scorePct: scorePercent,
      earnedMarks,
      totalMarks: totalPossibleMarks,
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
  if (assessment.courseId) {
    revalidatePath(`/student/courses/${assessment.courseId}`)
  }

  return {
    success: true,
    scorePercent,
    isPassed,
    correctCount,
    totalQuestions,
    earnedMarks,
    totalPossibleMarks,
  }
}
