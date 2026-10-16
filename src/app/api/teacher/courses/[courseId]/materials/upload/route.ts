import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { uploadDocumentToCloudinary } from "@/server/cloudinary"

export const dynamic = "force-dynamic"
export const maxDuration = 60

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

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const customTitle = formData.get("title") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 })
    }

    // Limit to 40MB
    const MAX_SIZE = 40 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 40MB." },
        { status: 400 }
      )
    }

    const originalName = file.name || "study_material"
    const extension = originalName.split(".").pop()?.toUpperCase() || "PDF"
    const title = customTitle?.trim() || originalName.replace(/\.[^/.]+$/, "")

    // Calculate human readable file size
    const sizeInMB = file.size / (1024 * 1024)
    const formattedSize =
      sizeInMB >= 1
        ? `${sizeInMB.toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const uploadRes = await uploadDocumentToCloudinary(buffer, originalName, courseId)

    const material = await db.courseMaterial.create({
      data: {
        courseId,
        title,
        fileUrl: uploadRes.secure_url || uploadRes.url,
        fileSize: formattedSize,
        fileType: extension,
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
    console.error("Upload course material error:", error)
    return NextResponse.json(
      { error: "Failed to upload study material file." },
      { status: 500 }
    )
  }
}
