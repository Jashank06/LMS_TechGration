import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { createCommunityPost, getCommunityPosts } from "@/server/services/community-service"
import { PostCategory, PostPriority } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoryParam = searchParams.get("category")
    const courseId = searchParams.get("courseId") || undefined
    const search = searchParams.get("search") || undefined
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50

    const category = categoryParam && categoryParam !== "ALL"
      ? (categoryParam as PostCategory)
      : undefined

    const posts = await getCommunityPosts({
      userId: user.id,
      role: user.role,
      courseId,
      category,
      search,
      limit,
    })

    return NextResponse.json({
      success: true,
      posts,
      currentUser: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("GET /api/community/posts error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch community posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      content,
      category,
      priority,
      isPinned,
      courseId,
      bannerUrl,
      actionUrl,
      actionLabel,
      rescheduledStartsAt,
      meetingUrl,
    } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      )
    }

    const post = await createCommunityPost({
      authorId: user.id,
      title,
      content,
      category: category as PostCategory,
      priority: (priority as PostPriority) || PostPriority.NORMAL,
      isPinned: Boolean(isPinned),
      courseId: courseId || null,
      bannerUrl: bannerUrl || null,
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      rescheduledStartsAt: rescheduledStartsAt || null,
      meetingUrl: meetingUrl || null,
    })

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error: any) {
    console.error("POST /api/community/posts error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create community post" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    )
  }
}
