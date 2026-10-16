import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params

    const assessments = await db.assessment.findMany({
      where: { courseId },
      include: {
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
      orderBy: { createdAt: "desc" },
    })

    const formatted = assessments.map((quiz) => {
      const passedAttempts = quiz.attempts.filter((a) => a.passed).length
      const totalAttempts = quiz.attempts.length
      const passRate =
        totalAttempts > 0
          ? Math.round((passedAttempts / totalAttempts) * 100)
          : 0

      const avgScore =
        totalAttempts > 0
          ? Math.round(
              quiz.attempts.reduce((acc, a) => acc + a.scorePct, 0) /
                totalAttempts
            )
          : null

      return {
        id: quiz.id,
        courseId: quiz.courseId,
        title: quiz.title,
        description: quiz.description,
        timeLimitMinutes: Math.round(quiz.timeLimitSec / 60),
        timeLimitSec: quiz.timeLimitSec,
        passingPct: quiz.passingPct,
        createdAt: quiz.createdAt.toISOString(),
        questionCount: quiz.questions.length,
        totalAttempts,
        passedAttempts,
        passRate,
        averageScore: avgScore,
        questions: quiz.questions.map((q) => ({
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
        recentAttempts: quiz.attempts.slice(0, 10).map((att) => ({
          id: att.id,
          studentName: att.user.name,
          studentEmail: att.user.email,
          scorePct: att.scorePct,
          passed: att.passed,
          submittedAt: att.submittedAt?.toISOString() || att.startedAt.toISOString(),
        })),
      }
    })

    return NextResponse.json({ assessments: formatted })
  } catch (error) {
    console.error("Failed to fetch course assessments:", error)
    return NextResponse.json(
      { error: "Failed to fetch course assessments" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const body = await request.json()

    const { title, description, timeLimitMinutes, passingPct, questions } = body

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one question are required" },
        { status: 400 }
      )
    }

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const timeLimitSec = (Number(timeLimitMinutes) || 15) * 60
    const passThreshold = Number(passingPct) || 70

    // Create assessment with nested questions and options in Prisma
    const newAssessment = await db.assessment.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        timeLimitSec,
        passingPct: passThreshold,
        questions: {
          create: questions.map((q: any, qIdx: number) => ({
            prompt: q.prompt.trim(),
            explanation: q.explanation?.trim() || null,
            points: Number(q.points) || 10,
            position: qIdx + 1,
            type: "MCQ_SINGLE",
            options: {
              create: (q.options || []).map((opt: any, optIdx: number) => ({
                label: typeof opt === "string" ? opt.trim() : opt.label.trim(),
                isCorrect: Boolean(opt.isCorrect),
                position: optIdx + 1,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Assessment created successfully",
      assessment: newAssessment,
    })
  } catch (error) {
    console.error("Failed to create assessment:", error)
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    )
  }
}
