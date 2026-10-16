import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId } = await params

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: { position: "asc" },
        },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { startedAt: "desc" },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const passedAttempts = assessment.attempts.filter((a) => a.passed).length
    const totalAttempts = assessment.attempts.length
    const passRate =
      totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            assessment.attempts.reduce((acc, a) => acc + a.scorePct, 0) / totalAttempts
          )
        : null

    const formatted = {
      id: assessment.id,
      courseId: assessment.courseId,
      courseTitle: assessment.course.title,
      title: assessment.title,
      description: assessment.description,
      timeLimitMinutes: Math.round(assessment.timeLimitSec / 60),
      timeLimitSec: assessment.timeLimitSec,
      passingPct: assessment.passingPct,
      createdAt: assessment.createdAt.toISOString(),
      questionCount: assessment.questions.length,
      totalAttempts,
      passedAttempts,
      passRate,
      averageScore: avgScore,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        type: q.type,
        points: q.points,
        explanation: q.explanation,
        position: q.position,
        options: q.options.map((o) => ({
          id: o.id,
          label: o.label,
          isCorrect: o.isCorrect,
          position: o.position,
        })),
      })),
      attempts: assessment.attempts.map((att) => ({
        id: att.id,
        studentName: att.user.name,
        studentEmail: att.user.email,
        scorePct: att.scorePct,
        passed: att.passed,
        submittedAt: att.submittedAt?.toISOString() || att.startedAt.toISOString(),
      })),
    }

    return NextResponse.json({ assessment: formatted })
  } catch (error) {
    console.error("Failed to fetch assessment:", error)
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId } = await params
    const body = await request.json()
    const { title, description, timeLimitMinutes, passingPct, questions } = body

    if (!title) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 }
      )
    }

    const existing = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          select: { id: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const timeLimitSec = (Number(timeLimitMinutes) || 15) * 60
    const passThreshold = Number(passingPct) || 70

    // Update basic assessment metadata
    const updated = await db.assessment.update({
      where: { id: assessmentId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        timeLimitSec,
        passingPct: passThreshold,
      },
    })

    // If new questions array is provided, replace questions and options
    if (Array.isArray(questions) && questions.length > 0) {
      const existingQIds = existing.questions.map((q) => q.id)

      if (existingQIds.length > 0) {
        // Delete related attempt answers for previous questions
        await db.attemptAnswer.deleteMany({
          where: { questionId: { in: existingQIds } },
        })

        // Delete previous question options
        await db.questionOption.deleteMany({
          where: { questionId: { in: existingQIds } },
        })

        // Delete previous questions
        await db.question.deleteMany({
          where: { id: { in: existingQIds } },
        })
      }

      // Create new questions with their options
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx]
        await db.question.create({
          data: {
            assessmentId,
            prompt: q.prompt.trim(),
            explanation: q.explanation?.trim() || null,
            points: Number(q.points) || 10,
            position: qIdx + 1,
            type: "MCQ_SINGLE",
            options: {
              create: (q.options || []).map((opt: { label: string; isCorrect: boolean } | string, optIdx: number) => ({
                label: typeof opt === "string" ? opt.trim() : opt.label.trim(),
                isCorrect: typeof opt === "string" ? false : Boolean(opt.isCorrect),
                position: optIdx + 1,
              })),
            },
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Assessment updated successfully",
      assessment: updated,
    })
  } catch (error) {
    console.error("Failed to update assessment:", error)
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId } = await params

    const existing = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { select: { id: true } },
        attempts: { select: { id: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const questionIds = existing.questions.map((q) => q.id)
    const attemptIds = existing.attempts.map((a) => a.id)

    // Delete attempt answers
    if (attemptIds.length > 0 || questionIds.length > 0) {
      await db.attemptAnswer.deleteMany({
        where: {
          OR: [
            ...(attemptIds.length > 0 ? [{ attemptId: { in: attemptIds } }] : []),
            ...(questionIds.length > 0 ? [{ questionId: { in: questionIds } }] : []),
          ],
        },
      })
    }

    // Delete attempts
    if (attemptIds.length > 0) {
      await db.assessmentAttempt.deleteMany({
        where: { assessmentId },
      })
    }

    // Delete options
    if (questionIds.length > 0) {
      await db.questionOption.deleteMany({
        where: { questionId: { in: questionIds } },
      })
    }

    // Delete questions
    if (questionIds.length > 0) {
      await db.question.deleteMany({
        where: { assessmentId },
      })
    }

    // Delete assessment
    await db.assessment.delete({
      where: { id: assessmentId },
    })

    return NextResponse.json({
      success: true,
      message: "Quiz and all student attempts deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete assessment:", error)
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    )
  }
}
