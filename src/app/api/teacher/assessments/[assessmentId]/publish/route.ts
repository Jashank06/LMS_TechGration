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
    const body = await request.json().catch(() => ({}))
    const { resultsPublished } = body

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
    })

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const targetState =
      resultsPublished !== undefined
        ? Boolean(resultsPublished)
        : !assessment.resultsPublished

    const updated = await db.assessment.update({
      where: { id: assessmentId },
      data: {
        resultsPublished: targetState,
      },
    })

    revalidatePath(`/student/assessments/${assessmentId}`)
    revalidatePath("/student/assessments")
    revalidatePath("/teacher/quizzes")
    if (assessment.courseId) {
      revalidatePath(`/student/courses/${assessment.courseId}`)
      revalidatePath(`/teacher/courses/${assessment.courseId}/assessments`)
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      resultsPublished: updated.resultsPublished,
      message: updated.resultsPublished
        ? "Results successfully published! Students can now view their grades, answer keys, and model solutions."
        : "Results unpublished. Answers and explanations are now concealed from students.",
    })
  } catch (error: any) {
    console.error("Toggle publish results error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to toggle result publishing" },
      { status: 500 }
    )
  }
}
