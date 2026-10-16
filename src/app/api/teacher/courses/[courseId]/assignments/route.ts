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

    const assignments = await db.assignment.findMany({
      where: { courseId },
      include: {
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formatted = assignments.map((asgn) => {
      const graded = asgn.submissions.filter((s) => s.status === "GRADED")
      const pending = asgn.submissions.filter((s) => s.status !== "GRADED")
      const avgScore =
        graded.length > 0
          ? Math.round(
              graded.reduce((acc, s) => acc + (s.marksAwarded || 0), 0) /
                graded.length
            )
          : null

      return {
        id: asgn.id,
        courseId: asgn.courseId,
        title: asgn.title,
        instructions: asgn.instructions,
        maxMarks: asgn.maxMarks,
        dueAt: asgn.dueAt.toISOString(),
        attachments: asgn.attachments,
        createdAt: asgn.createdAt.toISOString(),
        totalSubmissions: asgn.submissions.length,
        gradedCount: graded.length,
        pendingCount: pending.length,
        averageScore: avgScore,
        submissions: asgn.submissions.map((s) => ({
          id: s.id,
          studentId: s.userId,
          studentName: s.user.name,
          studentEmail: s.user.email,
          submittedAt: s.submittedAt.toISOString(),
          status: s.status,
          studentNotes: s.studentNotes,
          fileUrl: s.fileUrl,
          marksAwarded: s.marksAwarded,
          feedback: s.feedback,
          gradedAt: s.gradedAt?.toISOString() || null,
        })),
      }
    })

    return NextResponse.json({ assignments: formatted })
  } catch (error) {
    console.error("Failed to fetch course assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch course assignments" },
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

    const { title, instructions, maxMarks, dueAt, attachments } = body

    if (!title || !instructions || !dueAt) {
      return NextResponse.json(
        { error: "Title, instructions, and due date are required" },
        { status: 400 }
      )
    }

    const parsedDue = new Date(dueAt)
    if (isNaN(parsedDue.getTime())) {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 })
    }

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const newAssignment = await db.assignment.create({
      data: {
        courseId,
        title: title.trim(),
        instructions: instructions.trim(),
        maxMarks: Number(maxMarks) || 100,
        dueAt: parsedDue,
        attachments: Array.isArray(attachments)
          ? attachments.filter((url: string) => url && typeof url === "string")
          : [],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Assignment created successfully",
      assignment: newAssignment,
    })
  } catch (error) {
    console.error("Failed to create assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
