import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { CodingDifficulty } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get("difficulty")
    const topic = searchParams.get("topic")
    const search = searchParams.get("search")
    const status = searchParams.get("status") || "all"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))

    // Build where clause
    const where: any = { isPublished: true }

    if (difficulty && Object.values(CodingDifficulty).includes(difficulty as CodingDifficulty)) {
      where.difficulty = difficulty as CodingDifficulty
    }

    if (topic) {
      where.topics = { has: topic }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch problems
    const [problems, total] = await Promise.all([
      db.codingProblem.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          topics: true,
          xpReward: true,
          acceptedCount: true,
          submissionCount: true,
          isDailyChallenge: true,
          position: true,
          type: true,
          stage: true,
          stageTitle: true,
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.codingProblem.count({ where }),
    ])

    // Fetch user's progress for these problems
    const problemIds = problems.map((p) => p.id)
    const userProgress = await db.codingProgress.findMany({
      where: { userId: user.id, problemId: { in: problemIds } },
      select: { problemId: true, isSolved: true, attemptCount: true },
    })

    const progressMap = new Map(userProgress.map((p) => [p.problemId, p]))

    // Merge progress into problems
    let enriched = problems.map((p) => {
      const prog = progressMap.get(p.id)
      return {
        ...p,
        isSolved: prog?.isSolved || false,
        attemptCount: prog?.attemptCount || 0,
        acceptanceRate: p.submissionCount > 0 ? Math.round((p.acceptedCount / p.submissionCount) * 100) : 0,
      }
    })

    // Filter by solved status
    if (status === "solved") {
      enriched = enriched.filter((p) => p.isSolved)
    } else if (status === "unsolved") {
      enriched = enriched.filter((p) => !p.isSolved)
    }

    return NextResponse.json({
      success: true,
      problems: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Arena problems list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
