import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get streak data
    const streak = await db.codingStreak.findUnique({ where: { userId: user.id } })

    // Get solved problems grouped by difficulty
    const solvedProblems = await db.codingProgress.findMany({
      where: { userId: user.id, isSolved: true },
      include: {
        problem: { select: { difficulty: true, topics: true } },
      },
    })

    // Count by difficulty
    const solvedByDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 }
    const solvedTopics: Record<string, number> = {}

    for (const sp of solvedProblems) {
      const diff = sp.problem.difficulty
      solvedByDifficulty[diff] = (solvedByDifficulty[diff] || 0) + 1
      for (const topic of sp.problem.topics) {
        solvedTopics[topic] = (solvedTopics[topic] || 0) + 1
      }
    }

    // Total problems by difficulty (for progress bars)
    const totalByDifficulty = await db.codingProblem.groupBy({
      by: ["difficulty"],
      where: { isPublished: true },
      _count: true,
    })

    const totalMap: Record<string, number> = {}
    for (const t of totalByDifficulty) {
      totalMap[t.difficulty] = t._count
    }

    // Total submissions & accuracy
    const submissionStats = await db.codingSubmission.aggregate({
      where: { userId: user.id, isRunOnly: false },
      _count: true,
    })

    const acceptedCount = await db.codingSubmission.count({
      where: { userId: user.id, isRunOnly: false, verdict: "ACCEPTED" },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalXp: streak?.totalXp || 0,
        totalSolved: streak?.totalSolved || 0,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        lastActiveDate: streak?.lastActiveDate || null,
        solvedByDifficulty,
        totalByDifficulty: totalMap,
        topicProgress: solvedTopics,
        totalSubmissions: submissionStats._count,
        acceptedSubmissions: acceptedCount,
        accuracy: submissionStats._count > 0 ? Math.round((acceptedCount / submissionStats._count) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("Arena stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
