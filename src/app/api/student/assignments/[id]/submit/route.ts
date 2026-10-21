import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { validateAssignmentSubmission } from "@/actions/assignments"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: assignmentId } = await params
    const body = await req.json()
    const { studentNotes, fileUrl, fileName, githubUrl } = body

    const validation = await validateAssignmentSubmission(assignmentId, user.id)
    if (!validation.allowed) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { assignment, targetStatus } = validation
    const notes = studentNotes || (githubUrl ? `GitHub Repo: ${githubUrl}` : "Mobile Submission")
    const resolvedFileUrl = fileUrl || githubUrl || null

    // Upsert submission in MongoDB
    const submission = await db.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId: user.id,
        },
      },
      create: {
        assignmentId,
        userId: user.id,
        studentNotes: notes,
        fileUrl: resolvedFileUrl,
        fileName: fileName || "submission.zip",
        status: targetStatus,
        submittedAt: new Date(),
      },
      update: {
        studentNotes: notes,
        fileUrl: resolvedFileUrl,
        fileName: fileName || "submission.zip",
        status: targetStatus,
        submittedAt: new Date(),
      },
    })

    revalidatePath(`/student/assignments/${assignmentId}`)
    revalidatePath("/student/assignments")
    revalidatePath("/student/dashboard")
    revalidatePath("/student/leaderboard")
    revalidatePath("/student/rewards")
    if (assignment.courseId) {
      revalidatePath(`/student/courses/${assignment.courseId}`)
    }
    revalidatePath("/teacher/assignments")
    revalidatePath(`/teacher/assignments/${assignmentId}/grade`)

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully!",
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    })
  } catch (error: any) {
    console.error("Assignment submission error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit assignment" },
      { status: 500 }
    )
  }
}
