import { NextResponse } from "next/server"
import { db } from "@/server/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const json = await request.json()

    // 1. Reordering modules
    if (json.type === "MODULES" && Array.isArray(json.modules)) {
      for (let i = 0; i < json.modules.length; i++) {
        await db.module
          .update({
            where: { id: json.modules[i].id },
            data: { position: i + 1 },
          })
          .catch(() => {})
      }
      const updatedModules = await db.module.findMany({
        where: { courseId },
        include: { lessons: true },
        orderBy: { position: "asc" },
      })
      return NextResponse.json({ success: true, modules: updatedModules })
    }

    // 2. Reordering lessons within a module
    if (json.type === "LESSONS" && json.moduleId && Array.isArray(json.lessons)) {
      for (let i = 0; i < json.lessons.length; i++) {
        await db.lesson
          .update({
            where: { id: json.lessons[i].id },
            data: { position: i + 1 },
          })
          .catch(() => {})
      }
      const updatedLessons = await db.lesson.findMany({
        where: { moduleId: json.moduleId },
        orderBy: { position: "asc" },
      })
      return NextResponse.json({ success: true, lessons: updatedLessons })
    }

    return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 })
  } catch (error) {
    console.error("Reorder API error:", error)
    return NextResponse.json({ error: "Failed to reorder items" }, { status: 500 })
  }
}
