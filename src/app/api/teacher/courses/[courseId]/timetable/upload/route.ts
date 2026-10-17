import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { uploadTimetableToCloudinary } from "@/server/cloudinary"

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
      return NextResponse.json({ error: "No timetable file was provided." }, { status: 400 })
    }

    // Limit to 40MB
    const MAX_SIZE = 40 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Timetable file exceeds maximum size limit of 40MB." },
        { status: 400 }
      )
    }

    const originalName = file.name || "course_timetable.pdf"
    const extension = originalName.split(".").pop()?.toUpperCase() || "PDF"
    const title = customTitle?.trim() || originalName.replace(/\.[^/.]+$/, "")

    // Calculate formatted human-readable size
    const sizeInMB = file.size / (1024 * 1024)
    const formattedSize =
      sizeInMB >= 1
        ? `${sizeInMB.toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    let fileUrl: string
    try {
      const uploadRes = await uploadTimetableToCloudinary(buffer, originalName, courseId)
      fileUrl = uploadRes.secure_url || uploadRes.url
    } catch (uploadErr) {
      console.warn("Cloudinary upload failed, falling back to data URL or error:", uploadErr)
      // If Cloudinary fails for any reason, generate a safe data URI or rethrow
      throw uploadErr
    }

    try {
      await db.course.update({
        where: { id: courseId },
        data: {
          timetableUrl: fileUrl,
          timetableTitle: title,
          timetableFileName: originalName,
          timetableFileSize: formattedSize,
          timetableFileType: extension,
          timetableUpdatedAt: new Date(),
        },
      })
    } catch (dbUpdateErr) {
      console.warn("Prisma course.update failed, using MongoDB $runCommandRaw fallback:", dbUpdateErr)
      await db.$runCommandRaw({
        update: "Course",
        updates: [
          {
            q: { _id: { $oid: courseId } },
            u: {
              $set: {
                timetableUrl: fileUrl,
                timetableTitle: title,
                timetableFileName: originalName,
                timetableFileSize: formattedSize,
                timetableFileType: extension,
                timetableUpdatedAt: { $date: new Date().toISOString() },
              },
            },
          },
        ],
      })
    }

    return NextResponse.json({
      success: true,
      message: "Course timetable uploaded successfully!",
      timetable: {
        url: fileUrl,
        title,
        fileName: originalName,
        fileSize: formattedSize,
        fileType: extension,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Upload course timetable error:", error)
    return NextResponse.json(
      { error: "Failed to upload timetable file. Please try again." },
      { status: 500 }
    )
  }
}
