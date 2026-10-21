import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "weekly"

    // Calculate date range
    let dateFilter: Date
    if (period === "daily") {
      dateFilter = new Date()
      dateFilter.setHours(0, 0, 0, 0)
    } else if (period === "monthly") {
      dateFilter = new Date()
      dateFilter.setDate(1)
      dateFilter.setHours(0, 0, 0, 0)
    } else {
      // Weekly (default) — last 7 days
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get XP logs for the period, grouped by user
    const xpLogs = await db.codingXpLog.findMany({
      where: { awardedAt: { gte: dateFilter } },
      select: { userId: true, amount: true },
    })

    // Aggregate XP by user
    const userXpMap = new Map<string, number>()
    for (const log of xpLogs) {
      userXpMap.set(log.userId, (userXpMap.get(log.userId) || 0) + log.amount)
    }

    // Sort by XP descending
    const sorted = Array.from(userXpMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)

    if (sorted.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        currentUserRank: null,
      })
    }

    // Fetch user details
    const userIds = sorted.map(([id]) => id)
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, profile: { select: { avatarUrl: true } } },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    // Get streak + totalSolved for each user
    const streaks = await db.codingStreak.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, totalSolved: true, currentStreak: true, totalXp: true },
    })
    const streakMap = new Map(streaks.map((s) => [s.userId, s]))

    const leaderboard = sorted.map(([userId, weeklyXp], index) => {
      const u = userMap.get(userId)
      const s = streakMap.get(userId)
      return {
        rank: index + 1,
        userId,
        name: u?.name || "Unknown",
        avatarUrl: u?.profile?.avatarUrl || null,
        weeklyXp,
        totalXp: s?.totalXp || 0,
        totalSolved: s?.totalSolved || 0,
        streak: s?.currentStreak || 0,
      }
    })

    // Find current user's rank
    const currentUserRank = leaderboard.find((l) => l.userId === user.id)?.rank || null

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserRank,
      period,
    })
  } catch (error) {
    console.error("Arena leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
