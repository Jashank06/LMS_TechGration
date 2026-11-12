import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { getPinnedCommunityPosts } from "@/server/services/community-service"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pinnedPosts = await getPinnedCommunityPosts(user.id)

    return NextResponse.json({
      success: true,
      pinnedPosts,
    })
  } catch (error: any) {
    console.error("GET /api/community/pinned error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch pinned posts" },
      { status: 500 }
    )
  }
}
