import { NextResponse } from "next/server"
import { db } from "@/server/db"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const updated = await db.course.update({
      where: { id: courseId },
      data: {
        approvalStatus: "IN_REVIEW",
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Curriculum successfully submitted for administrative review.",
      course: updated,
    })
  } catch (error) {
    console.error("Submit course API error:", error)
    return NextResponse.json({ error: "Failed to submit course" }, { status: 500 })
  }
}
