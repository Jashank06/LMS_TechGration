import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { uploadCourseThumbnailToCloudinary, deleteCourseThumbnailFromCloudinary } from "@/server/cloudinary"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize teacher or admin
    const currentUser = await getCurrentUser()
    const teacherSession = await getTeacherSession()

    const authorizedUser = teacherSession?.user || currentUser
    if (
      !authorizedUser ||
      (authorizedUser.role !== "TEACHER" &&
        authorizedUser.role !== "ADMIN" &&
        authorizedUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Instructor access required." },
        { status: 401 }
      )
    }

    // 2. Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const courseSlug = (formData.get("courseSlug") as string) || "course"

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid format. Please upload a high-resolution JPG, PNG, WebP, or AVIF image.",
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Image exceeds 10MB limit. Please upload a file under 10MB.",
        },
        { status: 400 }
      )
    }

    // 3. Process buffer and upload to Cloudinary CDN
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await uploadCourseThumbnailToCloudinary(buffer, courseSlug)

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      message: "Thumbnail uploaded to Cloudinary successfully.",
    })
  } catch (error: any) {
    console.error("Cloudinary course thumbnail upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to upload course thumbnail to Cloudinary.",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    const teacherSession = await getTeacherSession()
    const authorizedUser = teacherSession?.user || currentUser

    if (
      !authorizedUser ||
      (authorizedUser.role !== "TEACHER" &&
        authorizedUser.role !== "ADMIN" &&
        authorizedUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get("publicId")

    if (publicId) {
      await deleteCourseThumbnailFromCloudinary(publicId)
    }

    return NextResponse.json({
      success: true,
      message: "Thumbnail deleted successfully.",
    })
  } catch (error: any) {
    console.error("Cloudinary delete thumbnail error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete thumbnail." },
      { status: 500 }
    )
  }
}
