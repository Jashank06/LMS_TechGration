import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { problemSlug } = await req.json()
    if (!problemSlug) {
      return NextResponse.json({ error: "Missing problemSlug" }, { status: 400 })
    }

    const problem = await db.codingProblem.findUnique({
      where: { slug: problemSlug },
      select: { id: true },
    })

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    const existing = await db.codingProgress.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    })

    const newBookmarkedState = !existing?.isBookmarked

    await db.codingProgress.upsert({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
      create: {
        userId: user.id,
        problemId: problem.id,
        isBookmarked: true,
      },
      update: {
        isBookmarked: newBookmarkedState,
      },
    })

    return NextResponse.json({
      success: true,
      isBookmarked: newBookmarkedState,
    })
  } catch (error) {
    console.error("Bookmark toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
