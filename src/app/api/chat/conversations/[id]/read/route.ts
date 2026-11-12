import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { markConversationAsRead } from "@/server/services/chat-service"

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
    const result = await markConversationAsRead(conversationId, user.id)

    return NextResponse.json({
      success: true,
      markedReadCount: result.count,
    })
  } catch (error: any) {
    console.error("Mark read error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to mark read" },
      { status: 500 }
    )
  }
}
