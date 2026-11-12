import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { toggleMessageReaction } from "@/server/services/chat-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: messageId } = await params
    const body = await req.json().catch(() => ({}))
    const { emoji } = body

    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Emoji required" }, { status: 400 })
    }

    const reactions = await toggleMessageReaction(messageId, user.id, emoji)

    return NextResponse.json({
      success: true,
      reactions,
    })
  } catch (error: any) {
    console.error("Toggle reaction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update reaction" },
      { status: 500 }
    )
  }
}
