import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET() {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignmentsRaw = await db.assignment.findMany({
      where: {
        course: { instructorName: session.user.name },
      },
      include: {
        course: true,
        submissions: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const assignments = assignmentsRaw.map((a) => {
      const gradedCount = a.submissions.filter((s) => s.status === "GRADED").length
      const pendingCount = a.submissions.filter((s) => s.status !== "GRADED").length
      const totalCount = a.submissions.length

      return {
        id: a.id,
        courseId: a.courseId,
        courseTitle: a.course.title,
        title: a.title,
        instructions: a.instructions,
        maxMarks: a.maxMarks,
        dueAt: a.dueAt.toISOString(),
        totalSubmissions: totalCount,
        gradedSubmissions: gradedCount,
        pendingGrading: pendingCount,
        averageScore: 0,
        submissions: a.submissions.map((s) => ({
          id: s.id,
          assignmentId: s.assignmentId,
          studentId: s.userId,
          studentName: s.user.name,
          studentEmail: s.user.email,
          studentAvatar: "/brand/avatar-default.png",
          submittedAt: s.submittedAt.toISOString(),
          isLate: false,
          latePenaltyPct: 0,
          status: s.status,
          studentNotes: s.studentNotes || "",
          codeLanguage: "javascript",
          submittedCodeSnippet: "",
          attachedFiles: [],
          marksAwarded: s.marksAwarded,
          feedback: s.feedback,
          gradedAt: s.gradedAt?.toISOString(),
          rubricScores: [],
        })),
      }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Assignments API error:", error)
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 })
  }
}
