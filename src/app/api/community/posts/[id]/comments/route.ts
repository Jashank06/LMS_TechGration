import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { addPostComment } from "@/server/services/community-service"

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
    const { content } = body

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      )
    }

    const comment = await addPostComment(id, user.id, content)

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error: any) {
    console.error("POST /api/community/posts/[id]/comments error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add comment" },
      { status: 500 }
    )
  }
}
