import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { uploadAvatarToCloudinary, deleteAvatarFromCloudinary } from "@/server/cloudinary"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

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
          error: "Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.",
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Image exceeds 5MB size limit. Please upload a smaller photo.",
        },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary with face-detection crop & auto format
    const uploadResult = await uploadAvatarToCloudinary(buffer, user.id)

    // Update database profile
    await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        avatarUrl: uploadResult.secure_url,
      },
      create: {
        userId: user.id,
        avatarUrl: uploadResult.secure_url,
        timezone: "Asia/Kolkata",
      },
    })

    // Revalidate relevant pages
    revalidatePath("/student/settings")
    revalidatePath("/student/dashboard")
    revalidatePath("/student/my-courses")
    revalidatePath("/student")
    revalidatePath("/")

    return NextResponse.json({
      success: true,
      avatarUrl: uploadResult.secure_url,
      message: "Profile picture uploaded successfully.",
    })
  } catch (error: any) {
    console.error("Error in avatar upload route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to upload avatar to Cloudinary.",
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      )
    }

    await deleteAvatarFromCloudinary(user.id)

    await db.userProfile.updateMany({
      where: { userId: user.id },
      data: {
        avatarUrl: null,
      },
    })

    revalidatePath("/student/settings")
    revalidatePath("/student/dashboard")
    revalidatePath("/student/my-courses")
    revalidatePath("/student")
    revalidatePath("/")

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully.",
    })
  } catch (error: any) {
    console.error("Error deleting avatar:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to remove avatar.",
      },
      { status: 500 }
    )
  }
}
