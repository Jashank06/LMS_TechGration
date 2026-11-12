import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import {
  getConversationMessages,
  sendChatMessage,
} from "@/server/services/chat-service"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const messages = await getConversationMessages(conversationId, user.id)

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error: any) {
    console.error("Fetch conversation messages error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 403 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const body = await req.json().catch(() => ({}))
    const {
      text,
      codeSnippet,
      codeLanguage,
      attachments,
      attachmentMeta,
      voiceNoteUrl,
      voiceNoteDuration,
    } = body

    const hasText = text && typeof text === "string" && text.trim().length > 0
    const hasCode = codeSnippet && typeof codeSnippet === "string" && codeSnippet.trim().length > 0
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0
    const hasVoice = voiceNoteUrl && typeof voiceNoteUrl === "string" && voiceNoteUrl.trim().length > 0

    if (!hasText && !hasCode && !hasAttachments && !hasVoice) {
      return NextResponse.json(
        { error: "Message must contain text, code, an attachment, or a voice note." },
        { status: 400 }
      )
    }

    const message = await sendChatMessage({
      senderId: user.id,
      conversationId,
      text: text || "",
      codeSnippet,
      codeLanguage,
      attachments,
      attachmentMeta,
      voiceNoteUrl,
      voiceNoteDuration,
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error: any) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 400 }
    )
  }
}
