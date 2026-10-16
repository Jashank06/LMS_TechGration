import { NextResponse } from "next/server"
import { studentNudgeSchema } from "@/server/schemas/teacher-schemas"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentId } = await params
    const student = await db.user.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const json = await request.json()
    const parsed = studentNudgeSchema.parse({ studentId, ...json })

    await db.notification.create({
      data: {
        userId: studentId,
        title: parsed.subject,
        message: parsed.message,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Academic nudge successfully dispatched to ${student.name} (${student.email}).`,
      nudge: parsed,
    })
  } catch (error) {
    console.error("Nudge student API error:", error)
    return NextResponse.json({ error: "Failed to send nudge" }, { status: 500 })
  }
}
