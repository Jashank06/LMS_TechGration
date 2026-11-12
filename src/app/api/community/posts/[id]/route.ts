import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { deleteCommunityPost } from "@/server/services/community-service"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await deleteCommunityPost(id, user.id, user.role)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE /api/community/posts/[id] error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete post" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    )
  }
}
