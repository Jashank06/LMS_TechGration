import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; materialId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, materialId } = await params

    const material = await db.courseMaterial.findUnique({
      where: { id: materialId },
    })

    if (!material || material.courseId !== courseId) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    await db.courseMaterial.delete({
      where: { id: materialId },
    })

    return NextResponse.json({
      success: true,
      message: "Study material deleted successfully.",
    })
  } catch (error) {
    console.error("Delete material error:", error)
    return NextResponse.json(
      { error: "Failed to delete study material" },
      { status: 500 }
    )
  }
}
