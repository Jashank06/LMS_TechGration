import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { SubmissionStatus } from "@prisma/client"

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

    const notes = studentNotes || (githubUrl ? `GitHub Repo: ${githubUrl}` : "Mobile Submission")

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
        fileUrl: fileUrl || githubUrl || null,
        fileName: fileName || "submission.zip",
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      update: {
        studentNotes: notes,
        fileUrl: fileUrl || githubUrl || null,
        fileName: fileName || "submission.zip",
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    })

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
    return NextResponse.json({ error: error.message || "Failed to submit assignment" }, { status: 500 })
  }
}
