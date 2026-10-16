import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId } = await params

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            enrollments: {
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
        },
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
          orderBy: { submittedAt: "desc" },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("Failed to fetch assignment:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId } = await params
    const body = await request.json()
    const { title, instructions, maxMarks, dueAt, attachments } = body

    if (!title || !instructions) {
      return NextResponse.json(
        { error: "Title and instructions are required" },
        { status: 400 }
      )
    }

    const updated = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        title: title.trim(),
        instructions: instructions.trim(),
        maxMarks: maxMarks ? parseInt(String(maxMarks), 10) : 100,
        dueAt: dueAt ? new Date(dueAt) : undefined,
        attachments: Array.isArray(attachments) ? attachments : [],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      assignment: updated,
    })
  } catch (error) {
    console.error("Failed to update assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId } = await params

    const existing = await db.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Cascade delete submissions first
    await db.assignmentSubmission.deleteMany({
      where: { assignmentId },
    })

    // Delete assignment
    await db.assignment.delete({
      where: { id: assignmentId },
    })

    return NextResponse.json({
      success: true,
      message: "Assignment and all associated student submissions deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  }
}
