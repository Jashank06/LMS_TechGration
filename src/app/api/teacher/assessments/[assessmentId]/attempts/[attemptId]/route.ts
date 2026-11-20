import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assessmentId: string; attemptId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized teacher access" }, { status: 401 })
    }

    const { assessmentId, attemptId } = await params

    const attempt = await db.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        assessment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
            questions: {
              orderBy: { position: "asc" },
              include: {
                options: true,
              },
            },
          },
        },
        answers: true,
      },
    })

    if (!attempt || attempt.assessmentId !== assessmentId) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    // Map answer by questionId
    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]))

    // Format all questions with diagnostic details
    const questionReports = attempt.assessment.questions.map((q) => {
      const studentAnswer = answerMap.get(q.id)
      const selectedOptionId =
        studentAnswer?.selectedOptionIds && studentAnswer.selectedOptionIds.length > 0
          ? studentAnswer.selectedOptionIds[0]
          : null
      const selectedOption = q.options.find((o) => o.id === selectedOptionId)
      const correctOption = q.options.find((o) => o.isCorrect)
      const isCorrect = Boolean(selectedOption && correctOption && selectedOption.id === correctOption.id)

      return {
        id: q.id,
        position: q.position,
        prompt: q.prompt,
        topic: q.topic,
        points: q.points > 0 ? q.points : 1,
        explanation: q.explanation,
        selectedOptionId,
        selectedOptionText: selectedOption?.label || null,
        correctOptionId: correctOption?.id || null,
        correctOptionText: correctOption?.label || null,
        isCorrect,
        pointsAwarded: isCorrect ? (q.points > 0 ? q.points : 1) : 0,
        options: q.options.map((o) => ({
          id: o.id,
          label: o.label,
          isCorrect: o.isCorrect,
          isSelected: o.id === selectedOptionId,
        })),
      }
    })

    // Fetch coding problems details if present
    const codingProblems = await db.codingProblem.findMany({
      where: {
        slug: { in: ["student-marks-analyzer", "student-data-analysis-pandas"] },
      },
      select: {
        slug: true,
        title: true,
        statement: true,
        solutionCode: true,
      },
    })

    const codingReports = (Array.isArray(attempt.codingResponses) ? attempt.codingResponses : []).map(
      (resp: any) => {
        const prob = codingProblems.find((p) => p.slug === resp.problemSlug)
        return {
          ...resp,
          title: prob?.title || resp.problemTitle || resp.problemSlug,
          statement: prob?.statement,
          solutionCode: prob?.solutionCode,
        }
      }
    )

    return NextResponse.json({
      success: true,
      report: {
        attemptId: attempt.id,
        assessmentId: attempt.assessment.id,
        assessmentTitle: attempt.assessment.title,
        courseTitle: attempt.assessment.course.title,
        resultsPublished: attempt.assessment.resultsPublished,
        allowReattempt: attempt.allowReattempt,
        student: {
          id: attempt.user.id,
          name: attempt.user.name,
          email: attempt.user.email,
          avatarUrl: attempt.user.profile?.avatarUrl,
        },
        scores: {
          scorePct: attempt.scorePct,
          earnedMarks: attempt.earnedMarks,
          totalMarks: attempt.totalMarks,
          mcqMarks: attempt.mcqMarks,
          codingMarks: attempt.codingMarks,
          passed: attempt.passed,
        },
        submittedAt: attempt.submittedAt?.toISOString() || attempt.startedAt.toISOString(),
        mcqQuestions: questionReports,
        codingResponses: codingReports,
      },
    })
  } catch (error: any) {
    console.error("Teacher inspect attempt error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch attempt report" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string; attemptId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized teacher access" }, { status: 401 })
    }

    const { assessmentId, attemptId } = await params
    const body = await request.json()
    const { codingMarks, earnedMarks } = body

    const existing = await db.assessmentAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!existing || existing.assessmentId !== assessmentId) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    const newCodingMarks =
      codingMarks !== undefined ? Number(codingMarks) : existing.codingMarks
    const newEarned =
      earnedMarks !== undefined
        ? Number(earnedMarks)
        : existing.mcqMarks + newCodingMarks

    const newPct =
      existing.totalMarks > 0
        ? Math.round((newEarned / existing.totalMarks) * 100)
        : existing.scorePct

    const updated = await db.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        codingMarks: newCodingMarks,
        earnedMarks: newEarned,
        scorePct: newPct,
      },
    })

    revalidatePath("/teacher/quizzes")
    revalidatePath(`/student/assessments/${assessmentId}`)

    return NextResponse.json({
      success: true,
      message: "Marks successfully updated.",
      updated: {
        scorePct: updated.scorePct,
        earnedMarks: updated.earnedMarks,
        codingMarks: updated.codingMarks,
      },
    })
  } catch (error: any) {
    console.error("Teacher grade adjustment error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update grades" },
      { status: 500 }
    )
  }
}
