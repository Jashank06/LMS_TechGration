import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { sweepExpiredDuels } from "@/server/services/duel-service"
import { getHappyHourStatus } from "@/lib/duel-constants"
import { DuelMode, DuelStatus } from "@prisma/client"
import { DuelsHubClient } from "@/components/arena/duels/duels-hub-client"

export const metadata: Metadata = {
  title: "1v1 Code Duel & Battle Arena — TechGration LMS",
  description: "Live real-time competitive DSA battles, authentic speedrun ghost racing, and 2x XP daily rushes.",
}

export default async function DuelsHubPage() {
  const user = await requireStudent()

  // 1. Lazy sweeper for expired duels
  await sweepExpiredDuels().catch(() => {})

  const now = new Date()

  // 2. Fetch Active Open Challenges
  const rawOpenChallenges = await db.codingDuel.findMany({
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
    take: 24,
  })

  const openChallenges = rawOpenChallenges.map((c) => ({
    id: c.id,
    code: c.code,
    topic: c.topic,
    difficulty: c.difficulty,
    stakeXp: c.stakeXp,
    expiresAt: c.expiresAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    creator: c.creator,
    problem: c.problem,
  }))

  // 3. Fetch Authentic Ghost Runners (Zero Fake Data)
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
        submittedAt: sub.submittedAt.toISOString(),
      })
    }
    if (ghostRunners.length >= 12) break
  }

  // 4. Student Duel Stats
  const [totalDuelsCreated, totalDuelsJoined, totalWon, streak] = await Promise.all([
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

  // 5. Active In-Progress Duel (if currently matched)
  const activeDuelRaw = await db.codingDuel.findFirst({
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

  // 6. Happy Hour Status
  const happyHour = getHappyHourStatus()

  return (
    <DuelsHubClient
      initialOpenChallenges={openChallenges as any}
      initialGhostRunners={ghostRunners as any}
      happyHour={happyHour}
      stats={{
        totalDuels,
        wonDuels: totalWon,
        winRate,
        currentStreak: streak?.currentStreak || 0,
        totalXp: streak?.totalXp || 0,
      }}
      activeDuel={activeDuelRaw}
      currentUserId={user.id}
    />
  )
}
