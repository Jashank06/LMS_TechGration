import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      select: { courseId: true },
    })
    const courseIds = enrollments.map((e) => e.courseId)

    const assignments = await db.assignment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: {
          where: { userId: user.id },
          select: {
            id: true,
            status: true,
            marksAwarded: true,
            feedback: true,
            submittedAt: true,
            fileUrl: true,
            studentNotes: true,
          },
        },
      },
      orderBy: { dueAt: "asc" },
    })

    return NextResponse.json({
      success: true,
      assignments: assignments.map((a) => {
        const submission = a.submissions[0]
        return {
          id: a.id,
          courseId: a.courseId,
          courseTitle: a.course.title,
          title: a.title,
          instructions: a.instructions,
          dueAt: a.dueAt,
          maxMarks: a.maxMarks,
          status: submission ? submission.status : "PENDING",
          marksAwarded: submission?.marksAwarded ?? null,
          feedback: submission?.feedback ?? null,
          submittedAt: submission?.submittedAt ?? null,
          fileUrl: submission?.fileUrl ?? null,
          studentNotes: submission?.studentNotes ?? null,
        }
      }),
    })
  } catch (error: any) {
    console.error("Student assignments API error:", error)
    return NextResponse.json({ error: error.message || "Failed to load assignments" }, { status: 500 })
  }
}
