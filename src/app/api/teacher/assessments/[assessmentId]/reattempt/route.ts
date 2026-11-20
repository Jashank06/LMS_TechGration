import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized teacher access" }, { status: 401 })
    }

    const { assessmentId } = await params
    const body = await request.json()
    const { attemptId, userId, allowReattempt = true, resetAttempt = false } = body

    if (!attemptId && !userId) {
      return NextResponse.json(
        { error: "attemptId or userId required to enable reattempt." },
        { status: 400 }
      )
    }

    const where: any = { assessmentId }
    if (attemptId) {
      where.id = attemptId
    } else if (userId) {
      where.userId = userId
    }

    const existingAttempt = await db.assessmentAttempt.findFirst({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { startedAt: "desc" },
    })

    if (!existingAttempt) {
      return NextResponse.json({ error: "Student attempt not found" }, { status: 404 })
    }

    if (resetAttempt) {
      // Hard reset: Delete previous attempt so student starts completely fresh
      await db.assessmentAttempt.delete({
        where: { id: existingAttempt.id },
      })
    } else {
      // Soft authorization: Enable reattempt flag on attempt
      await db.assessmentAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          allowReattempt: Boolean(allowReattempt),
        },
      })
    }

    revalidatePath(`/student/assessments/${assessmentId}`)
    revalidatePath("/teacher/quizzes")

    return NextResponse.json({
      success: true,
      message: `Reattempt successfully authorized for ${existingAttempt.user.name} (${existingAttempt.user.email}). The student can now retake this assessment.`,
      studentName: existingAttempt.user.name,
      studentEmail: existingAttempt.user.email,
    })
  } catch (error: any) {
    console.error("Teacher allow reattempt error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to configure reattempt" },
      { status: 500 }
    )
  }
}
