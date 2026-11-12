import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import {
  uploadChatAttachmentToCloudinary,
  uploadVoiceNoteToCloudinary,
} from "@/server/cloudinary"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Allow up to 60s for Cloudinary CDN uploads

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "file"
    const conversationId = formData.get("conversationId") as string | null
    const durationStr = formData.get("duration") as string | null
    const duration = durationStr ? parseFloat(durationStr) : undefined

    if (!file) {
      return NextResponse.json({ error: "No file was provided." }, { status: 400 })
    }

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required." }, { status: 400 })
    }

    // Verify conversation access
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { studentId: true, teacherId: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 })
    }

    const isParticipant =
      conversation.studentId === user.id ||
      conversation.teacherId === user.id ||
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN"

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Forbidden: You are not a participant in this conversation." },
        { status: 403 }
      )
    }

    // Size limit check
    const MAX_FILE_SIZE = 35 * 1024 * 1024 // 35 MB
    const MAX_VOICE_SIZE = 15 * 1024 * 1024 // 15 MB

    if (type === "voice" && file.size > MAX_VOICE_SIZE) {
      return NextResponse.json(
        { error: "Voice message exceeds 15MB limit." },
        { status: 400 }
      )
    }

    if (type === "file" && file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File attachment exceeds 35MB limit." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (type === "voice") {
      const uploadResult = await uploadVoiceNoteToCloudinary(buffer, conversationId)
      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        name: file.name || "voice_note.mp3",
        size: file.size,
        type: file.type || "audio/mp3",
        duration: duration || uploadResult.duration,
      })
    } else {
      const originalName = file.name || "attachment"
      const uploadResult = await uploadChatAttachmentToCloudinary(
        buffer,
        originalName,
        conversationId
      )

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        name: originalName,
        size: file.size,
        type: file.type,
      })
    }
  } catch (error: any) {
    console.error("Chat upload error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to upload chat file." },
      { status: 500 }
    )
  }
}
