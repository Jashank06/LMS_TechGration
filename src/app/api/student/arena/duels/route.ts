import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import {
  createDuel,
  createGhostDuel,
  sweepExpiredDuels,
} from "@/server/services/duel-service"
import { getHappyHourStatus } from "@/lib/duel-constants"
import { DuelMode, DuelStatus } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Lazy Sweeper: reclaim expired staked duels & refund creators
    await sweepExpiredDuels().catch((err) =>
      console.warn("Lazy sweep error:", err)
    )

    const now = new Date()

    // 2. Fetch Active Open Challenges in Public Lobby
    const openChallenges = await db.codingDuel.findMany({
      where: {
        mode: DuelMode.OPEN_CHALLENGE,
        status: DuelStatus.WAITING,
        expiresAt: { gt: now },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            xpReward: true,
            topics: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    // 3. Fetch Authentic Ghost Runners (Zero-Mock: only real batchmates' AC runs)
    const rawGhostSubmissions = await db.codingSubmission.findMany({
      where: {
        verdict: "ACCEPTED",
        isRunOnly: false,
        userId: { not: user.id },
        executionTimeMs: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        problem: {
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            xpReward: true,
            topics: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 30,
    })

    // Deduplicate ghosts per problem so we show unique challenges
    const seenProblems = new Set<string>()
    const ghostRunners = []
    for (const sub of rawGhostSubmissions) {
      if (!seenProblems.has(sub.problemId)) {
        seenProblems.add(sub.problemId)
        ghostRunners.push({
          submissionId: sub.id,
          user: sub.user,
          problem: sub.problem,
          executionTimeMs: sub.executionTimeMs,
          totalTests: sub.totalTests,
          submittedAt: sub.submittedAt,
        })
      }
      if (ghostRunners.length >= 12) break
    }

    // 4. Student Personal Duel Stats
    const [totalDuelsCreated, totalDuelsJoined, totalWon, streak] =
      await Promise.all([
        db.codingDuel.count({
          where: { creatorId: user.id, status: DuelStatus.COMPLETED },
        }),
        db.codingDuel.count({
          where: { opponentId: user.id, status: DuelStatus.COMPLETED },
        }),
        db.codingDuel.count({
          where: { winnerId: user.id, status: DuelStatus.COMPLETED },
        }),
        db.codingStreak.findUnique({ where: { userId: user.id } }),
      ])

    const totalDuels = totalDuelsCreated + totalDuelsJoined
    const winRate = totalDuels > 0 ? Math.round((totalWon / totalDuels) * 100) : 0

    // 5. Active duel for current user (if currently inside an ongoing match)
    const activeDuel = await db.codingDuel.findFirst({
      where: {
        OR: [{ creatorId: user.id }, { opponentId: user.id }],
        status: { in: [DuelStatus.WAITING, DuelStatus.COUNTDOWN, DuelStatus.IN_PROGRESS] },
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        code: true,
        mode: true,
        status: true,
        stakeXp: true,
        problem: { select: { title: true, difficulty: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // 6. Happy hour status
    const happyHour = getHappyHourStatus()

    return NextResponse.json({
      success: true,
      openChallenges,
      ghostRunners,
      happyHour,
      stats: {
        totalDuels,
        wonDuels: totalWon,
        winRate,
        currentStreak: streak?.currentStreak || 0,
        totalXp: streak?.totalXp || 0,
      },
      activeDuel,
    })
  } catch (error) {
    console.error("Duels hub API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
    const { mode, submissionId, difficulty, topic, stakeXp, expiryHours, problemId } = body

    if (!mode) {
      return NextResponse.json({ error: "Missing mode" }, { status: 400 })
    }

    // Ghost Battle Flow
    if (mode === "GHOST_RACE") {
      if (!submissionId) {
        return NextResponse.json(
          { error: "submissionId is required for Ghost Battle" },
          { status: 400 }
        )
      }

      const duel = await createGhostDuel({
        creatorId: user.id,
        submissionId,
      })

      return NextResponse.json({
        success: true,
        duel: {
          id: duel.id,
          code: duel.code,
          mode: duel.mode,
          status: duel.status,
        },
      })
    }

    // Open Challenge or Direct Friend Invite Flow
    const duel = await createDuel({
      creatorId: user.id,
      mode,
      difficulty,
      topic,
      stakeXp: Number(stakeXp) || 0,
      expiryHours: Number(expiryHours) || 24,
      problemId,
    })

    return NextResponse.json({
      success: true,
      duel: {
        id: duel.id,
        code: duel.code,
        mode: duel.mode,
        status: duel.status,
      },
    })
  } catch (error: any) {
    console.error("Create duel API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create duel" },
      { status: 400 }
    )
  }
}
