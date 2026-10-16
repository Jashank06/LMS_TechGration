import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

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
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, fileUrl, fileSize, fileType } = body

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: "Title and file URL are required" },
        { status: 400 }
      )
    }

    const cleanType = fileType ? fileType.trim().toUpperCase() : "PDF"
    const cleanSize = fileSize && fileSize.trim() ? fileSize.trim() : "2.4 MB"

    const material = await db.courseMaterial.create({
      data: {
        courseId,
        title: title.trim(),
        fileUrl: fileUrl.trim(),
        fileSize: cleanSize,
        fileType: cleanType,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Study material uploaded successfully!",
      material: {
        ...material,
        createdAt: material.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Create course material error:", error)
    return NextResponse.json(
      { error: "Failed to upload study material" },
      { status: 500 }
    )
  }
}

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
    const materials = await db.courseMaterial.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      materials: materials.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Get course materials error:", error)
    return NextResponse.json(
      { error: "Failed to get study materials" },
      { status: 500 }
    )
  }
}
