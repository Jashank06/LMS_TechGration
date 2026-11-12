import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { togglePostReaction } from "@/server/services/community-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { emoji } = body

    if (!emoji || typeof emoji !== "string") {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    const updatedReactions = await togglePostReaction(id, user.id, emoji)

    return NextResponse.json({
      success: true,
      reactions: updatedReactions,
    })
  } catch (error: any) {
    console.error("POST /api/community/posts/[id]/reaction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to toggle reaction" },
      { status: 500 }
    )
  }
}
